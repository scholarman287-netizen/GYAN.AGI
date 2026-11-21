# Independent Test of Paradoxical Equilibrium Theory

Nov 21, 2026 · @Aman

## 1. Executive assessment

Paradoxical Equilibrium (PE) is coherent only after three repairs, and once repaired it reduces to established concepts. I found no mathematically novel result. As written, the strong-PE signature is neither necessary nor sufficient for strong PE, and its key quantity ℓ(x\*) is not determined by the system alone.

**Main findings**

- **Objective and dynamics are never linked.** Definition 3.1 defines equilibrium through the transition law G. The signature uses the gradient of the objective F. Without a stated link, such as ẋ = ∇F, a point can satisfy the signature without being an equilibrium (counterexample C3).
- **ℓ(x*) depends on bookkeeping, not on the system.*\* Moving a term between the local objectives fᵢ and the interaction I leaves F and the dynamics unchanged but switches strong PE to weak PE. In the manuscript's own model, ℓ(x\*) went from (1.33, −1.33) to (0, 0) (counterexample C5).
- **The signature is not sufficient.** At a saddle point the signature holds, yet moving in the locally preferred direction increases F (C1). The manuscript already warns about this; I confirm it and show condition 5 can fail too.
- **The signature is not necessary, and interaction is not required.** A single variable with a box constraint and no interaction satisfies all five conditions of Definition 3.3, while ∇F ≠ 0 (C4). This contradicts the boundary claim attached to Proposition 13.1.
- **Repaired PE is a known structure.** Under gradient dynamics at a nondegenerate maximum, strong PE holds exactly when ∇I(x\*) ≠ 0. That is an interior coupled optimum with a nonzero externality or binding constraint: Lagrange/KKT multipliers, Pigouvian externalities and "frustration" in physics.
- **Predictions are not yet distinctive.** Predictions 1–3 follow from any coupled optimization model. Predictions 4–5 are not stated precisely enough to test.

**Overall verdict**

| Question | Answer |
| --- | --- |
| Mathematically coherent? | Conditionally: after linking F to G, fixing how ℓ is defined, and defining admissibility |
| Independently useful? | Not shown: every test system is fully explained by standard dynamical-systems and optimization tools |
| Mathematically novel? | No new theorem found; the contribution is a cross-domain vocabulary and a checklist |
| What would establish it? | A decomposition-invariant definition of ℓ, plus one system where PE predicts something standard models do not |

**Scope.** The source is the repository's machine-extracted reconstruction of the 39-page manuscript (`research/paradoxical-equilibrium-theory.tex`) and `knowledge/PE_FOUNDATION.md`. Equation numbers refer to that text. Proofs are given by algebra. Numerical runs (Python, NumPy/SciPy) only illustrate and check them.

## 2. Reconstructed mathematical framework

PE combines four objects: a feasible state space, local objectives, a system objective with an interaction term, and a transition law. The manuscript defines each, but never states how the transition law relates to the objectives.

**Objects (manuscript notation)**

| Symbol | Meaning | Source |
| --- | --- | --- |
| X ⊆ Rⁿ, x = (x₁,…,xₙ) | feasible state space and state | eqs. 19–20 |
| f(x) = (f₁,…,fₘ) | m interacting objectives | eq. 21 |
| F(x) = Σ fᵢ(xᵢ) − I(x) | system objective; I = interaction, coupling, shared constraints | eqs. 12, 34, 56 |
| ẋ = G(x, u, w; θ) | transition law with control u, disturbance w, parameters θ | eqs. 32–33 |
| ℓᵢ(x) = ∇ₓᵢ fᵢ(x), ℓ = (ℓ₁,…,ℓₙ) | local optimization pressure | eqs. 24–25 |
| xᴸ, xᴳ | independent local optima; system optimum | eqs. 38–39 |
| Pₗ = ‖ℓ(x\*)‖, Dₗ = ‖x\* − xᴸ‖ | pressure and distance measures | eqs. 41–42 |
| A(x) = ℓᵀg / (‖ℓ‖‖g‖), g = ∇F | local–global alignment | eq. 46 |
| Q\_PE = (Pₗ, Dₗ, S, R, K) | descriptive tuple (stability, resilience, coupling) | eq. 50 |
| E\_PE = {x ∈ X : C(x) ≤ ε} | PE region for dynamic PE | eq. 55 |

**Core definitions**

- **Def. 3.1, system equilibrium:** G(x\*) = x\* (discrete time) or G(x\*) = 0 (continuous time).
- **Def. 3.2, local pressure:** ℓ(x\*) ≠ 0 means at least one component has a local incentive to move.
- **Def. 3.3, strong PE:** (1) x\* is a system equilibrium; (2) interacting objectives, constraints or components exist; (3) ℓ(x\*) ≠ 0; (4) x\* is stable, metastable, recurrent or otherwise sustainable; (5) moving in the locally favoured direction gives no admissible improvement of the system state.
- **Def. 3.4, weak PE:** competing objectives and system trade-offs exist, and ℓ(x\*) = 0 is allowed.
- **Dynamic PE (secs. 8, 15):** x(t) ∈ E\_PE for all t ≥ t₀; a stronger form requires dist(x(t), E\_PE) → 0.

**Central equation (secs. 5, 10).** At an interior stationary point of F:

```latex
\nabla F(x^*) = 0 \;\Longrightarrow\; \nabla f(x^*) = \nabla I(x^*), \qquad \text{signature: } \nabla F(x^*) = 0,\ \ \ell(x^*) \neq 0
```

**Established versus proposed**

| Established in the manuscript (valid derivation) | Only proposed |
| --- | --- |
| Eqs. 15–16 and 37: interior stationarity balances local gradients against interaction gradients | That the signature identifies a distinct class of equilibria |
| Prop. 12.1: ∇I(x\*) ≠ 0 implies ∇f(x\*) ≠ 0 at a stationary point | Necessary and sufficient conditions (sec. 16; the manuscript calls them "plausible") |
| Prop. 13.1: separable F on independent domains gives xᴸ = xᴳ | The descriptive tuple Q\_PE and any resilience link |
| A(x) is undefined where ∇F = 0 | All five predictions and cross-domain applications |
| Minimal quadratic model: closed-form x\*, y\* (eqs. 70–71) | Dynamic PE as a useful class |

**Assumptions the manuscript uses but does not state:** each fᵢ depends only on its own xᵢ (eq. 34 versus eq. 24, where fᵢ(x) depends on all of x); stationary points are interior; F is differentiable; m = n with one objective per variable; and the dynamics are gradient-like in F.

## 3. Claim-by-claim validity audit

Of 17 major claims, 5 are supported, 4 conditionally supported, 3 unproven, 2 contradicted and 3 undefined. The supported ones are all elementary; the problems sit in the definitions.

| # | Claim (location) | Status | Reason |
| --- | --- | --- | --- |
| 1 | Interior stationarity gives ∂fᵢ/∂xᵢ = ∂I/∂xᵢ (eqs. 15–16, 37) | SUPPORTED | Direct differentiation; needs fᵢ = fᵢ(xᵢ), differentiability, interior point |
| 2 | Equilibrium is distinct from stability; Jacobian test (sec. 14) | SUPPORTED | Standard linearization (Hartman–Grobman for hyperbolic points) |
| 3 | Prop. 12.1: ∇I(x\*) ≠ 0 implies component conditions fail | SUPPORTED | One line: ∇f = ∇I ≠ 0. "Generally differs" can be strengthened to "always differs" |
| 4 | Prop. 13.1: separable F, independent domains gives xᴸ = xᴳ | SUPPORTED | Max of a sum of independent terms = sum of maxes; with ties, the argmax sets coincide as products. Needs maximizers to exist |
| 5 | No universal scalar PE score; A(x) undefined at ∇F = 0 (sec. 7) | SUPPORTED | A divides by ‖∇F‖ = 0 |
| 6 | Pareto efficiency is not PE (sec. 17) | CONDITIONALLY SUPPORTED | True once dynamics are specified; test system 2 shows Def. 3.2 cannot even be evaluated for objectives sharing one variable |
| 7 | Signature ∇F = 0, ℓ ≠ 0 represents strong PE (eq. 60) | CONDITIONALLY SUPPORTED | Necessary only for interior points under gradient-like dynamics. Not necessary in general (C4), not sufficient (C1, C2) |
| 8 | Nash equilibrium is a special-case mechanism for PE (sec. 18) | CONDITIONALLY SUPPORTED | Only if each player's payoff differs from the fᵢ used for ℓ. If payoff = fᵢ, an interior Nash point has ℓ = 0, so weak PE only (test system 3) |
| 9 | Predictions 1–3 (secs. 25.1–25.3) | CONDITIONALLY SUPPORTED | True for any coupled model with ∇I ≠ 0, so they do not separate PE from rivals |
| 10 | Necessary and sufficient conditions (sec. 16) | UNPROVEN | The manuscript says "plausible". "Multiplicity" fails under Def. 3.3 as written (C4) |
| 11 | Prediction 4: regions outperform points in noisy systems | UNPROVEN | No model, metric or comparison is specified |
| 12 | Prediction 5: PE adds explanatory value | UNPROVEN | No system yet where PE predicts more than a standard model |
| 13 | Signature identifies strong PE in general | CONTRADICTED | C1 (saddle) and C2 (minimum) satisfy the signature but not stability; C4 has strong PE with ∇F ≠ 0 |
| 14 | "Strong PE requires interaction, shared constraints, or equivalent non-separability" (after Prop. 13.1) | CONTRADICTED | C4: one variable, separable F, independent box constraint satisfies all five conditions of Def. 3.3 |
| 15 | Def. 3.2, local pressure ℓᵢ = ∇ₓᵢ fᵢ | UNDEFINED | (a) m objectives vs n components (i runs over both); (b) fᵢ(x) in eq. 24 vs fᵢ(xᵢ) in eq. 34; (c) ℓ depends on how F is split (lemma below) |
| 16 | Def. 3.3 conditions 4–5 | UNDEFINED | "Otherwise dynamically sustainable" and "admissible improvement" have no definitions; the link between G and F is missing |
| 17 | Dynamic PE, weak PE and Q\_PE | UNDEFINED | x(t) ∈ E\_PE holds for any bounded trajectory once ε is large enough. Weak PE excludes almost no multi-objective system. S, R, K are unnamed quantities |

### Key derivations

**Prop. 12.1 is correct, and slightly stronger than stated.** Under eq. 56 with interior x\*:

```latex
\nabla F(x^*) = \nabla f(x^*) - \nabla I(x^*) = 0 \;\Rightarrow\; \nabla f(x^*) = \nabla I(x^*), \quad\text{so } \nabla I(x^*) \neq 0 \iff \ell(x^*) \neq 0
```

**Missing link between F and G.** Def. 3.1 asks for G(x\*) = 0, the signature asks for ∇F(x\*) = 0, and nothing forces the two zero sets to meet. They coincide for gradient-like dynamics:

```latex
G(x) = P(x)\,\nabla F(x), \qquad P(x) \succ 0 \;\Rightarrow\; \{G = 0\} = \{\nabla F = 0\}, \quad \tfrac{d}{dt}F = \nabla F^{\top} P \nabla F \ge 0
```

For any other G (selfish learning, delays, rotations), the signature and equilibrium are unrelated (C3).

**Decomposition lemma (proved here).** Take any C¹ functions gᵢ(xᵢ) and set f̃ᵢ = fᵢ + gᵢ and Ĩ = I + Σ gᵢ. Then F, G and every equilibrium are unchanged, but:

```latex
\tilde\ell_i(x^*) = \ell_i(x^*) + g_i'(x_i^*)
```

Choosing gᵢ' (xᵢ\*) = −ℓᵢ(x\*) gives ℓ̃(x\*) = 0, so weak PE; choosing gᵢ' (xᵢ\*) ≠ −ℓᵢ(x\*) gives strong PE. Hence ℓ(x\*) ≠ 0 is a property of the chosen description, not of the system. The manuscript's own warning against "arbitrary labeling" (sec. 27.4) applies to its central definition. It is fixed only if each fᵢ is pinned down independently, for example as the payoff that component i actually responds to.

**Notation drift.** Eq. 124 writes ẋ = f(x) + λI(x), using f and I as vector fields with a plus sign. Elsewhere they are scalar functions with I subtracted. The prediction it supports is therefore not well-defined as written.

## 4. Counterexamples and failed cases

Five counterexamples show the signature ∇F(x\*) = 0, ℓ(x\*) ≠ 0 is neither sufficient (C1, C2, C3) nor necessary (C4) for strong PE, and that ℓ itself is not well-defined (C5). All use the manuscript's quadratic template with a = 1, b = −1, λ = 1 unless stated.

### C1. Saddle with an admissible improvement (signature holds; conditions 4 and 5 fail)

Reverse the sign of the coupling, so components gain from being apart:

```latex
F(x,y) = -(x-a)^2 - (y-b)^2 + \lambda (x-y)^2, \qquad \dot x = \nabla F
```

Setting ∇F = 0 gives x + y = a + b and (x − y)(2λ − 1) = b − a. So x\* = (−1, 1) and ℓ(x\*) = (2(a − x\*), 2(b − y\*)) = (4, −4) ≠ 0. The Hessian \[\[−2+2λ, −2λ\], \[−2λ, −2+2λ\]\] has eigenvalues −2 and −2 + 4λ = +2: a saddle for every λ > 1/2. Here ℓ ∝ (1, −1) is exactly the unstable eigenvector, so moving 0.1 along ℓ raises F by +0.01. A 10⁻⁶ perturbation grows to distance 1.9 × 10⁴ by t = 12 (numerical check). The signature holds, but the point is unstable and the local direction is an admissible improvement.

### C2. Minimum of F (signature holds; condition 4 fails)

Flip the sign of every term: F = (x − a)² + (y − b)² + λ(x − y)² with ẋ = ∇F. The stationary point (1/3, −1/3) is unchanged, ∇F = 0, and the local gradients are nonzero. The Hessian eigenvalues are +2 and +6, a repelling minimum. A stationarity condition cannot tell maxima, minima and saddles apart.

### C3. Dynamics not derived from F (signature point is not an equilibrium)

Keep the manuscript's F, but let components follow their own gradients: ẋ = 2(a − x), ẏ = 2(b − y). The only equilibrium is (1, −1), where ∇F = (−4, 4) ≠ 0. At the signature point (1/3, −1/3), G = (1.33, −1.33) ≠ 0, so it is not an equilibrium. Condition 1 fails, because the theory never ties G to F.

### C4. Strong PE with no interaction (signature not necessary; Prop. 13.1's boundary claim fails)

One variable, F(x) = −(x − 2)² on X = \[0, 1\], under projected gradient ascent. The equilibrium is x\* = 1. Every condition of Def. 3.3 holds as written:

1. x\* = 1 is an equilibrium of the projected flow.
2. A constraint exists ("interacting objectives, constraints, or components").
3. ℓ(1) = 2(2 − 1) = 2 ≠ 0.
4. It is asymptotically stable.
5. Moving along ℓ leaves X, so it gives no admissible improvement.

Yet F is separable, the domain is independent, there is one component, and ∇F(1) = 2 ≠ 0. Using the projected gradient onto the tangent cone instead of the raw gradient gives ℓ = 0 here, which is the repair proposed in section 9.

### C5. Relabelling switches strong to weak PE

In the manuscript's own model, give each component the coupling cost it creates: f̃₁ = −(x − a)² − λ(x − y)² and f̃₂ = −(y − b)² − λ(x − y)², with Ĩ adjusted so F is unchanged. At x\* = (1/3, −1/3), ℓ goes from (1.33, −1.33) to (0, 0). The system, its dynamics and its equilibrium are identical; only the labels changed.

### Verdict on the signature

| Property | Status |
| --- | --- |
| Sufficient for strong PE | CONTRADICTED (C1, C2, C3) |
| Necessary for strong PE | CONTRADICTED in constrained problems (C4); necessary only for interior points under gradient-like dynamics |
| Well-defined | UNDEFINED until the local objectives are fixed independently of the modeller (C5) |
| Needs revision | Yes: see section 9 |

## 5. Test systems

All seven systems can be classified once the dynamics are fixed. In every case, standard stability analysis decides the answer and PE adds a label but no extra prediction. Unless stated, "PE" below means strong PE under gradient-like dynamics, the only reading where the signature means anything.

| # | System | Equilibria | Strong-PE verdict | What it shows |
| --- | --- | --- | --- | --- |
| 1 | Nonlinear cosine coupling | 2 stable maxima, 1 saddle | Yes at both maxima; saddle fails | Signature also holds at the unstable point |
| 2 | Two objectives, one variable | 1 | Cannot be evaluated | Def. 3.2 breaks when m ≠ n |
| 3 | Coupled pair, 3 dynamics | 3 different points | Depends on the dynamics and labels | PE is not a property of F alone |
| 4 | Optimal but unstable update rule | 1 strict maximum | No when η > 1/3 | An optimum does not certify condition 4 |
| 5 | Double wells + coupling | 9 critical points | 2 strong, 2 weak, 4 saddles fail, 1 minimum | Status varies per equilibrium |
| 6 | Equilibrium outside the feasible set | 0 admissible | No | Needs a definition of admissibility |
| 7 | Lossless exchange | Continuum (cycle) | Dynamic PE holds | Holds for any conservative system |

### 1. Two-variable nonlinear system

```latex
F(x,y) = -(x-1.5)^2 - (y+1.5)^2 - 3\,(1-\cos(x-y)), \qquad \dot x = \partial_x F,\ \dot y = \partial_y F
```

I searched for critical points with fsolve from 289 starts in \[−4, 4\]² and classified them with the Hessian H (stable iff all eigenvalues < 0, since ẋ = ∇F linearizes to ẏ = H y).

| Point | Hessian eigenvalues | Type | ℓ = (2(1.5 − x), 2(−1.5 − y)) |
| --- | --- | --- | --- |
| (0.408, −0.408) | −6.11, −2.00 | stable max | (2.18, −2.18) |
| (1.606, −1.606) | −2.00, +3.98 | saddle | (−0.21, 0.21) |
| (2.686, −2.686) | −5.67, −2.00 | stable max | (−2.37, 2.37) |

Both maxima are strong PE: ℓ ≠ 0, stable, and condition 5 holds because H is negative definite. The saddle satisfies the signature but is unstable. **Supports** the framework as a checklist; **contradicts** sufficiency of the signature.

### 2. Competing objectives

f₁ = −(x − 1)², f₂ = −(x + 1)², F = 0.7f₁ + 0.3f₂ on one variable. The optimum is x\* = 0.4 (stable under ẋ = F'). The objective gradients are +1.2 and −2.8. Def. 3.2 needs a variable xᵢ for each objective fᵢ, and there is only one variable, so ℓ is undefined. Reading it as ∇fⱼ makes every interior weighted-sum optimum of conflicting objectives "strong PE", which is ordinary multi-objective optimization. **Contradicts** the claim that PE is a distinct class unless Def. 3.2 is repaired.

### 3. Coupled system with interacting components

The manuscript's model (a = 1, b = −1, λ = 1) under three dynamics:

| Dynamics | Equilibrium | F at equilibrium | ℓ (manuscript fᵢ) | Classical name |
| --- | --- | --- | --- | --- |
| Planner: ẋ = ∇F | (0.333, −0.333) | −1.333 | (1.33, −1.33) | social optimum |
| Each bears half the coupling cost: ẋᵢ = ∂uᵢ/∂xᵢ, uᵢ = fᵢ − I/2 | (0.5, −0.5) | −1.5 | (1.0, −1.0); own-payoff gradient 0 | Nash equilibrium |
| Selfish: ignore coupling | (1, −1) | −4.0 | (0, 0) | independent optima |

The Nash point is "strong PE" with the manuscript's fᵢ but weak PE with the payoffs the agents actually follow. The gap between −1.333 and −1.5 is the familiar efficiency loss from externalities. **Supports** coherence after repair; **contradicts** the idea that PE is fixed by the system description F.

### 4. Appears stable, is dynamically unstable

The minimal model's optimum is a strict maximum (Hessian eigenvalues −2, −6). Under the discrete update xₜ₊₁ = xₜ + η∇F(xₜ), the error map has eigenvalues 1 + ημ with μ ∈ {−2, −6}, so it is stable iff η < 1/3.

| η | Distance from x\* after 60 steps |
| --- | --- |
| 0.20 | 1.6 × 10⁻¹¹ |
| 0.30 | 3.6 × 10⁻⁷ |
| 0.34 | 2.48 (growing) |
| 0.40 | 1.4 × 10⁸ |

The same optimum, with the same ℓ ≠ 0, is strong PE for η < 1/3 and not PE above it. **Supports** the manuscript's "equilibrium ≠ stability" and shows an objective alone cannot certify condition 4.

### 5. Multiple equilibria

```latex
F(x,y) = -(x^2-1)^2 - (y^2-1)^2 - 0.3\,(x-y)^2, \qquad \ell_i = -4x_i(x_i^2-1)
```

I found 9 critical points (169 starts in \[−1.6, 1.6\]²):

- (1, 1) and (−1, −1): stable maxima with ℓ = 0. The coupling is inactive because x = y. **Weak PE.**
- (0.837, −0.837) and its mirror: stable maxima with ℓ = ±(1.00, −1.00). **Strong PE.**
- Four saddles such as (0.907, −0.165): ℓ ≠ 0 but unstable. **Not PE**; the signature holds.
- (0, 0): a minimum. Not PE.

PE status varies point by point, and which state the system reaches depends on basins of attraction, which standard analysis supplies. **Neutral**: consistent, adds nothing predictive.

### 6. No admissible equilibrium

Take the minimal model with a = b = 2, λ = 1 and the admissible set X = {x, y ≥ 0, x + y ≤ 1}. Under unconstrained ẋ = ∇F, the only equilibrium is (2, 2), outside X. A trajectory from (0.2, 0.2) leaves X at t ≈ 0.092. No admissible equilibrium exists, so this is not PE. The theory reaches that verdict only if "admissible" is defined, which it is not. Under projected dynamics, the equilibrium moves to (0.5, 0.5) with ℓ = (3, 3) and a zero coupling gradient. The "pressure" there is just the budget constraint's Lagrange multiplier, μ = 3. **Shows** strong PE collapses to a binding constraint.

### 7. Components change, system stays stable

```latex
\dot x = u,\quad \dot y = -u,\quad \dot u = -\omega^2 (x - R/2), \qquad R = 2,\ \omega = 1,\ (x,y,u)_0 = (1.5,\,0.5,\,0)
```

The total x + y stays at 2 to within 2.7 × 10⁻¹⁵ (numerically; exactly by construction, since ẋ + ẏ = 0). Meanwhile x oscillates over \[0.5, 1.5\]. With f₁ = −(x − 1.2)², ℓ ≠ 0 for 99.9% of the time. Dynamic PE with C = |x + y − R| holds for every ε > 0. But any system with a conserved quantity (frictionless pendulum, Lotka–Volterra cycles) passes the same way. **Supports** consistency; **contradicts** the claim that dynamic PE picks out a special class.

## 6. Stability and admissibility results

Under gradient-like dynamics, conditions 1, 4 and 5 of Def. 3.3 collapse into one standard condition: a nondegenerate local maximum of F. Strong PE then reduces to “that maximum has ∇I(x\*) ≠ 0”. I prove this below; everything else in this section follows from it.

**Proposition A (reduction; proved here).** Assume F is C² with the form of eq. 56, each fᵢ depends only on xᵢ, and the dynamics are ẋ = P∇F with P constant and positive definite. Let x\* be an interior critical point with Hessian H negative definite. Then:

1. x\* is an equilibrium, because G(x\*) = P∇F(x\*) = 0.
2. x\* is locally asymptotically stable.
3. For every direction d ≠ 0, F(x\* + td) < F(x\*) for small t ≠ 0. So condition 5 holds for any admissibility notion based on improving F.
4. Hence x\* is strong PE if and only if ∇I(x\*) ≠ 0, equivalently x\* ≠ xᴸ when each fᵢ is strictly concave with an interior maximizer.

*Proof.* (1) is immediate. (2) The linearization is ẏ = PHy. PH is similar to P^{1/2} H P^{1/2}, which is symmetric negative definite, so every eigenvalue of PH is real and negative. (3) A second-order Taylor expansion gives:

```latex
F(x^*+td) = F(x^*) + \tfrac{t^2}{2}\, d^{\top} H d + o(t^2) < F(x^*) \quad\text{since } d^{\top}Hd<0
```

(4) By claim 1 in section 3, ∇f(x\*) = ∇I(x\*). For strictly concave fᵢ with interior maximizer xᵢᴸ, fᵢ′(xᵢ\*) = 0 holds iff xᵢ\* = xᵢᴸ. ∎

**What this means.** Under the most natural reading, strong PE is a stable interior optimum of a coupled objective where the interaction gradient is nonzero. Condition 5 adds nothing at nondegenerate maxima. It matters only at degenerate points or saddles, where C1 shows it can fail.

**Stability results from the test systems**

| Result | Status | Evidence |
| --- | --- | --- |
| The signature holds at unstable points (saddles, minima) | Proved | C1, C2: Hessian eigenvalues of mixed or positive sign |
| The same optimum can be stable or unstable depending on the update rule | Proved | Test system 4: the explicit Euler map is stable iff η < 2/μ\_max = 1/3 |
| PE status depends on which equilibrium the system reaches | Proved, illustrated numerically | Test system 5: 9 critical points, 4 different classifications |
| Dynamic PE holds for any conserved-quantity system | Proved | Test system 7: x + y is invariant because ẋ + ẏ = 0 |

**Admissibility.** The manuscript never defines it. A minimal definition consistent with its intent: given an admissible set A ⊆ X and the tangent cone T\_A(x\*), x\* has no admissible improvement along the local incentives if no direction d in T\_A(x\*) that lies in the cone spanned by the ℓᵢ (each on its own coordinates) gives F(x\* + td) > F(x\*) for small t > 0.

With this definition:

- **C4** is classified correctly once ℓ is replaced by its projection onto T\_A(x\*), which is 0.
- **Test system 6** fails because no equilibrium lies in A.
- **C1** fails because d = ℓ improves F.

**Gap that remains.** “Metastable, recurrent, or otherwise dynamically sustainable” still needs a single choice, for example Lyapunov stability of an equilibrium, or asymptotic stability of a compact invariant set for dynamic PE. Without one, condition 4 can be satisfied by appeal to whichever notion happens to fit.

## 7. Comparison with established theories

Every ingredient of repaired strong PE already exists in at least one established field. The closest matches are Lagrange/KKT multipliers, externalities in economics, and frustration in physics.

| Framework | Overlap with PE | Difference | Verdict |
| --- | --- | --- | --- |
| Constrained optimization (Lagrange, KKT) | At a constrained optimum, ∇f = μ∇g with μ ≠ 0: the objective "wants" to move but the constraint holds it. Test system 6 is exactly this | PE relabels μ∇g as ℓ | Same mathematics |
| Externalities and social optimum (Pigou) | At the social optimum, each agent's private marginal benefit equals the marginal external cost: ℓᵢ = ∂I/∂xᵢ (eq. 37) | PE names this the central paradox | Same mathematics; ℓᵢ is the Pigouvian tax that would make the point self-enforcing |
| Game theory: Nash equilibrium, price of anarchy, potential games | Nash vs social optimum gap (test system 3). If G is the gradient of a potential, PE's F is that potential | Strong PE needs components not to follow their own payoff gradients, so it describes enforced social optima, not Nash points | Overlaps fully once labels are fixed |
| Dynamical systems, Lyapunov stability | Conditions 1 and 4, dynamic PE as invariant/attracting sets (eqs. 97–98) | None beyond vocabulary | PE adopts these tools unchanged |
| Classical mechanics and statics | Force balance: each spring in a prestressed structure is away from its rest length, yet the structure is in stable equilibrium | None | Prestress, tensegrity: textbook cases of "∇F = 0 with ℓ ≠ 0" |
| Statistical physics: frustration, spin glasses | In a frustrated ground state, individual bonds are unsatisfied but the global energy is minimized | Frustration is defined precisely and has measurable consequences | Closest physical prior art; frustration is quantified, PE is not yet |
| Thermodynamic equilibrium | Equilibrium as an extremum of a potential under constraints; local subsystems can carry nonzero chemical-potential differences held by barriers | PE has no entropy or temperature structure | Analogy only |
| Multi-objective optimization (Pareto) | Conflicting objectives and trade-offs (test system 2) | PE adds dynamics and stability (sec. 17); correctly noted | Weighted-sum optima are already "weak PE" |
| Control theory | An enforced equilibrium where a controller u holds x\* against local drift: G(x\*, u\*) = 0 while uncontrolled components would move | PE has no controller model, though eq. 32 includes u | Strong PE ≈ a regulated set point; the controller effort plays the role of ℓ |
| Evolutionary and adaptive systems | Evolutionarily stable strategies, homeostasis, tension between individual and group selection | PE gives no selection dynamics or fitness model | Analogy; the organizational-paradox literature already models a "dynamic equilibrium" of tensions |

**Potential prior art to review** (cited from memory, not checked against the sources here; verify before citing):

- A. C. Pigou, *The Economics of Welfare* (1920): externalities and corrective taxes.
- G. Toulouse, "Theory of the frustration effect in spin glasses" (1977).
- D. Monderer and L. Shapley, "Potential Games" (1996).
- E. Koutsoupias and C. Papadimitriou, "Worst-case Equilibria" (1999): the price of anarchy.
- W. K. Smith and M. W. Lewis, "Toward a Theory of Paradox: A Dynamic Equilibrium Model of Organizing" (2011). The manuscript already cites this one (its ref. 8); it is the closest match to PE's name and qualitative claim.
- W. Karush (1939) and H. Kuhn and A. Tucker (1951): optimality conditions with multipliers.

The manuscript already compares PE with Pareto, Nash, homeostasis, control and organizational paradox (secs. 17–21). It lists externalities as one possible meaning of I (sec. 5), but never compares PE with Lagrange multipliers, the welfare economics of externalities, or frustration, which are the three closest mathematical matches.

## 8. Potentially novel contributions

No new theorem or mathematical object appears in the manuscript. What it offers is organizational: a shared vocabulary and a checklist that separates four properties often blurred together in applied work.

| Contribution | Novel? | Value |
| --- | --- | --- |
| Signature ∇F = 0 with ℓ ≠ 0 | No: the first-order condition of a coupled or constrained optimum | Useful teaching device |
| Separating equilibrium, local pressure, stability and admissibility (Def. 3.3) | Not mathematically, but rarely stated together across fields | Genuinely useful as a diagnostic checklist |
| Weak versus strong PE | Partly: it mirrors inactive versus active constraints or externalities | Useful once ℓ is fixed independently of the modeller (C5) |
| Descriptive tuple Q\_PE = (Pₗ, Dₗ, S, R, K) | Possibly, as a cross-domain reporting standard | Only if S, R and K get operational definitions |
| Dynamic PE regions E\_PE | No: invariant or attracting sets | None added yet |

**One possible route to real novelty.** Define ℓᵢ behaviourally as the gradient of the payoff that component i actually follows, measured from its own dynamics. Then Pₗ = ‖ℓ(x\*)‖ measures how much enforcement (coupling, regulation, constraint) holds the system away from where its parts would drift.

A law linking that enforcement load to resilience R or to failure under perturbation would be a substantive, testable claim. Standard Lagrangian or externality models do not state such a law on their own, so this is where PE could add something. The manuscript does not yet state or test it.

## 9. Required mathematical corrections

Six minimal corrections make Def. 3.3 well-defined and consistent with Prop. 13.1. The first two matter most: without them the central quantity ℓ(x\*) is not a property of the system.

1. **Link the dynamics to the objective.** State that G is gradient-like in F, or that F is a Lyapunov function for G:

```latex
G(x) = P(x)\,\nabla F(x),\quad P(x) \succ 0 \qquad\text{or}\qquad \nabla F(x)^{\top} G(x) \ge 0,\ \ \{G=0\} = \{\nabla F = 0\}
```

Otherwise drop ∇F = 0 from the signature and state everything in terms of G.

2. **Fix the local objectives independently of the modeller.** Define uᵢ as the payoff that component i actually responds to, for example identified from its uncontrolled dynamics ẋᵢ = ∂uᵢ/∂xᵢ. Then set ℓᵢ = ∂uᵢ/∂xᵢ. This removes the relabelling freedom of the decomposition lemma and C5.
3. **Match objectives to variables.** Require a map σ from objectives to the variables each controls, with ℓⱼ = ∇ of fⱼ over the variables x\_σ(j). This replaces the m-versus-n mismatch and resolves test system 2.
4. **Use tangent-cone (projected) gradients under constraints.** Replace the raw gradient with its projection onto the admissible set:

```latex
\ell_i^{A}(x^*) = \Pi_{T_A(x^*)}\!\left[\nabla_{x_i} u_i(x^*)\right]
```

This makes C4 weak PE, and the claim after Prop. 13.1 becomes provable for separable F with independent box constraints.

5. **Define admissibility and choose one stability notion.** Use the tangent-cone definition in section 6, plus Lyapunov or asymptotic stability, of x\* for static PE and of a compact invariant set for dynamic PE. Delete "metastable, recurrent, or otherwise sustainable" unless each is defined.
6. **Tighten dynamic PE.** Require E\_PE to be compact, invariant and attracting, and require ℓ ≠ 0 on a set of positive measure of the attractor. Fix ε by the system's own scale, not by choice. Otherwise every bounded or conservative system qualifies (test system 7).

**Minor corrections**

- Write Prop. 12.1's conclusion as "∇I(x\*) ≠ 0 if and only if ℓ(x\*) ≠ 0" instead of "generally differs".
- Make eq. 124 consistent with eq. 56, for example ẋ = ∇f(x) − λ∇I(x).
- Use one form for the local objectives: fᵢ(xᵢ) throughout, or fᵢ(x) with point 2 above.
- State the interior and differentiability assumptions wherever eqs. 15–16, 37 and 58 are used.

## 10. Testable predictions

After the corrections, PE's predictions coincide with those of Lagrangian, externality and control models, so none of them yet separates PE from rivals. The four tests below would either confirm PE's measurements or show that its claimed distinctiveness fails. Only T-B could give PE its own content.

| Test | Variables measured | Expected under PE | Expected under competing models | Counts against PE if |
| --- | --- | --- | --- | --- |
| T-A Release test | Behavioural ℓᵢ(x\*) before release; initial drift velocity ẋᵢ(0⁺) after the coupling or constraint is removed | Drift starts along ℓ, with speed proportional to Pₗ | Same (KKT: drift along the multiplier direction) | Drift is not aligned with measured ℓ. That would mean ℓ cannot be measured as the theory requires |
| T-B Enforcement-load law | Pₗ, Hessian H, loss in F after an enforcement lapse of length τ | Loss ≈ (τ²/2)· | ℓᵀHℓ | . PE-specific only if it also claims Pₗ alone ranks fragility across systems without knowing H |
| T-C Strong vs weak | Response to a small cut in coupling strength λ at weak (ℓ = 0) and strong (ℓ ≠ 0) equilibria | First-order shift only at strong PE | Same: inactive constraints have zero multipliers | Weak-PE states shift at first order. That would contradict claim 3 and eq. 37 |
| T-D Regions vs points (Prediction 4) | Noisy time series from a coupled system; out-of-sample log-likelihood | A region model (E\_PE) beats a point model | A stochastic stationary model (e.g. Ornstein–Uhlenbeck around x\*) is already a region model | The PE region model does not beat the stochastic stationary model |

**Derivation behind T-B (under correction 1).** If enforcement lapses for a short time τ, components move by about Δx ≈ τℓ(x\*). Because ∇F(x\*) = 0, the first-order change vanishes:

```latex
\Delta F \approx \tfrac{\tau^2}{2}\, \ell(x^*)^{\top} H\, \ell(x^*) \le 0 \quad (H \prec 0)
```

The loss is quadratic in local pressure. That is checkable, but it is ordinary calculus. PE would add content only through a cross-system law relating Pₗ to resilience R.

**A computational experiment that runs all four tests.** Simulate n = 2–50 agents sharing a resource with a quadratic congestion cost, under three regimes: planner (ẋ = ∇F), Nash (each agent follows its own payoff) and selfish (coupling ignored). Then:

1. Measure ℓᵢ by finite differences of each agent's own payoff.
2. Apply random enforcement lapses with τ in \[0.01, 1\].
3. Compare predicted and observed drift (T-A) and loss (T-B).
4. Repeat with noise for T-D.

Prespecify that PE gains support only if Pₗ predicts fragility better than the multiplier norm and the spectrum of H.

## 11. Adversarial review, open questions and next steps

The strongest objection is the decomposition lemma: until local objectives are fixed independently, any equilibrium of a coupled system can be labelled strong or weak PE at will. That is exactly the "arbitrary labeling" the manuscript itself rules out (sec. 27.4).

**Adversarial review summary**

| Reviewer question | Answer |
| --- | --- |
| Strongest counterexample | C5 and the decomposition lemma: the same system is strong or weak PE depending only on labels |
| Weakest assumption | That ∇F = 0 says anything about the dynamics G (C3) |
| When PE equals an established concept | Gradient dynamics at a nondegenerate maximum: an interior coupled optimum with ∇I ≠ 0, i.e. an active externality or Lagrange multiplier (Prop. A) |
| Claims that are too broad | Dynamic PE (any conservative system qualifies), weak PE (any multi-objective system qualifies), and cross-domain applications |
| Is it falsifiable? | As a distinct framework, yes, through the manuscript's own criteria 1 and 4 (sec. 26). Current evidence meets criterion 1: every test system here is fully explained by existing theory |
| Smallest justified corrections | Corrections 1, 2 and 4 in section 9 |

**Unresolved questions**

- How should uᵢ be identified for components that are not agents, such as physical subsystems or software modules?
- Is there a decomposition-invariant version of Pₗ, such as the norm of the enforcement force G(x\*) minus the uncontrolled dynamics at x\*?
- Does Pₗ predict resilience or fragility across systems beyond what H and the multipliers already tell us? This is the only route to novelty identified here.
- Which single stability notion should condition 4 use for dynamic PE: asymptotic stability, or something weaker such as stochastic stability?
- Can PE say anything about systems without a scalar F, such as non-potential games or cyclic dynamics?

**Recommended next steps**

1. Revise Defs. 3.2–3.3 with corrections 1–5 and restate Prop. 13.1 with tangent-cone pressures. Then prove it.
2. Add a related-work section on Lagrange/KKT multipliers, externalities and the price of anarchy, and frustration in physics.
3. State one PE-specific law, for example linking Pₗ to resilience, and register its test in advance.
4. Run the multi-agent experiment in section 10, with the competing models implemented side by side.
5. Submit the corrected core to a peer-reviewed venue in applied mathematics or complex systems before making cross-domain claims.

**Reproducibility.** The numerical checks are in `pe_tests/tests.py` (Python 3, NumPy 2.5, SciPy 1.18; results in `results.json`). They used finite-difference Hessians with step 10⁻⁴, fsolve root-finding from grids of starting points, and solve\_ivp with rtol 10⁻¹⁰. Every classification above was also derived by hand. The numbers only check the algebra and are not proofs. SymPy was not available, so no symbolic verification was run.