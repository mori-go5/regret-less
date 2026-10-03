# Regret.less — Requirements

## Overview

Regret.less is a decision visualization tool that helps users minimize regret in important life decisions.
It implements Jeff Bezos's "Regret Minimization Framework": imagining yourself at 80 years old looking back
to evaluate which choice would cause more regret.

---

## Functional Requirements

### Decision Input

WHEN a user opens the application
THE SYSTEM SHALL display a clean input form prompting the user to enter a decision they are facing.

WHEN a user submits a decision with two options (Option A and Option B) and their age
THE SYSTEM SHALL validate that all three fields are non-empty before proceeding.

WHEN a user submits an incomplete form
THE SYSTEM SHALL display inline validation errors next to the relevant fields.

### AI Analysis

WHEN a user submits a valid decision form
THE SYSTEM SHALL send the decision to the OpenAI API and display a loading animation with the message "Analyzing from your 80-year-old self's perspective...".

WHEN the AI analysis is complete
THE SYSTEM SHALL display a results dashboard containing:
- A regret risk score (0–100) for each option
- A radar chart with six evaluation axes
- A timeline showing predicted perspectives at 1 year, 5 years, 10 years, and age 80
- A plain-language AI commentary in Japanese
- A hidden intuition score revealing which option the user's phrasing suggests they already prefer

### Radar Chart Axes

THE SYSTEM SHALL evaluate each option on the following six axes:
1. Emotional regret risk (やらなかった後悔 vs やった後悔)
2. Opportunity loss (選ばないことで失うもの)
3. Reversibility (やり直しがきくか)
4. Growth potential (5年後の自分への影響)
5. Impact on others (家族・チームへの波及)
6. Intuition score (AIが文章から読み取る潜在的な本音)

### SNS Share Card

WHEN a user clicks the "Share" button on the results page
THE SYSTEM SHALL generate a styled image card containing the decision summary, regret risk scores, and a call-to-action.

WHEN the share card is generated
THE SYSTEM SHALL allow the user to download it as a PNG file.

### Reversibility Warning

WHEN the AI analysis determines that one option has a reversibility score below 30
THE SYSTEM SHALL highlight that option with a warning label: "この選択はやり直しが難しい".

---

## Non-Functional Requirements

WHEN the application is served
THE SYSTEM SHALL load the initial page within 2 seconds on a standard broadband connection.

WHEN an OpenAI API call fails
THE SYSTEM SHALL display a user-friendly error message and offer a retry button.

WHEN the user is on a mobile device
THE SYSTEM SHALL render all charts and layouts responsively without horizontal scrolling.
