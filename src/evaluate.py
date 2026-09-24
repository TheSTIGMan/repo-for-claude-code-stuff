"""
evaluate.py - Step 5: measure how well the pipeline answers questions.

Reads eval_questions.json, asks each question, and checks whether the
answer contains the expected key facts. Prints a score like "8/10"
and lists the questions that failed.

Each question in eval_questions.json looks like:
    {
      "question": "What is the refund window?",
      "expected_facts": ["30 days"],
      "expected_source": "policy.pdf"     <- optional: file that must be cited
    }
"""

import json
import sys
from pathlib import Path

from ingest import PROJECT_ROOT
from query import answer_question

QUESTIONS_FILE = PROJECT_ROOT / "eval_questions.json"
RESULTS_FILE = PROJECT_ROOT / "eval_results.json"


def normalize(text: str) -> str:
    """Lowercase and replace curly apostrophes, so "don’t" matches "don't"."""
    return text.lower().replace("’", "'")


def check_answer(answer: str, expected_facts: list[str], expected_source: str | None) -> list[str]:
    """Return a list of what is missing from the answer. Empty list = pass."""
    missing = [fact for fact in expected_facts if normalize(fact) not in normalize(answer)]

    # Also check that the answer cites the right file, if the test asks for it.
    if expected_source and normalize(expected_source) not in normalize(answer):
        missing.append(f"citation of {expected_source}")

    return missing


def load_questions(path: Path = QUESTIONS_FILE) -> list[dict]:
    """Read the test questions from the JSON file."""
    if not path.exists():
        raise FileNotFoundError(f"Questions file not found: {path}")
    with open(path, encoding="utf-8") as file:
        return json.load(file)


def run_evaluation(questions: list[dict]) -> list[dict]:
    """Ask every question and record whether it passed."""
    results = []
    for number, item in enumerate(questions, start=1):
        print(f"[{number}/{len(questions)}] {item['question']}")

        try:
            answer = answer_question(item["question"])["answer"]
        except RuntimeError as error:
            # An API error counts as a failure, but we keep going.
            answer = f"ERROR: {error}"

        missing = check_answer(answer, item["expected_facts"], item.get("expected_source"))
        results.append(
            {
                "question": item["question"],
                "answer": answer,
                "passed": not missing,
                "missing": missing,
            }
        )
    return results


def print_report(results: list[dict]) -> None:
    """Print the score and the details of each failed question."""
    passed = sum(result["passed"] for result in results)
    print(f"\nSCORE: {passed}/{len(results)}")

    failed = [result for result in results if not result["passed"]]
    if not failed:
        print("All questions passed.")
        return

    print("\nFAILED QUESTIONS:")
    for result in failed:
        print(f"\n- Q: {result['question']}")
        print(f"  Missing: {', '.join(result['missing'])}")
        print(f"  Answer: {result['answer'][:300]}")


# Run the evaluation:
#   python src/evaluate.py
if __name__ == "__main__":
    try:
        questions = load_questions()
    except (FileNotFoundError, json.JSONDecodeError) as error:
        print(f"Could not load questions: {error}")
        sys.exit(1)

    results = run_evaluation(questions)
    print_report(results)

    # Save full results so you can read every answer later.
    with open(RESULTS_FILE, "w", encoding="utf-8") as file:
        json.dump(results, file, indent=2, ensure_ascii=False)
    print(f"\nFull results saved to {RESULTS_FILE.name}")
