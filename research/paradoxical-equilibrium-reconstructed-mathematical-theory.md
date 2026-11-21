# Paradoxical Equilibrium: Reconstructed Mathematical Theory

Nov 21, 2026 · @Aman

## 1. Overview

PE is rebuilt here around one measurable object: the motion each component would show if the system-level mechanism holding it were switched off. Strong PE becomes “a stable equilibrium maintained by a nonzero enforcement force”. Its distinct claim is a law for how the system responds when that enforcement fails.

**Author's intent that is preserved**

- A system can sit at a sustainable equilibrium while its components retain a nonzero incentive to move.
- That incentive is counterbalanced by coupling, shared constraints or collective effects.
- Equilibrium, local pressure, stability and admissibility are separate conditions.
- Weak PE (pressure may vanish) and dynamic PE (sustainable regions, not only points) remain.
- The theory is a research program, not a universal law.

**What changed and why**

| Original | Reconstructed | Reason (review finding) |
| --- | --- | --- |
| Local pressure ℓᵢ = ∇ₓᵢ fᵢ, from a chosen split of F | ℓ = released drive: the velocity components show when enforcement is removed | The split of F was arbitrary (C5); a release intervention fixes ℓ by observation |
| Signature ∇F = 0, ℓ ≠ 0 defines strong PE | Defined on the dynamics G; the signature is recovered as a theorem for gradient-like G | F and G were never linked (C3) |
| Raw gradients under constraints | Projected onto the tangent cone of each component's own constraints; shared constraints count as enforcement | A single box constraint produced “strong PE” (C4) |
| “Stable, metastable, recurrent or otherwise sustainable” | Lyapunov stability or asymptotic stability, stated explicitly | Condition 4 was undefined |
| Dynamic PE: x(t) ∈ E\_PE | A compact attracting set that is not invariant under the released dynamics | Every conservative system qualified (test system 7) |
| No PE-specific prediction | Enforcement-failure law: critical lapse τ\_c ≈ d\_B(ℓ̂)/Pₗ | Predictions 1–3 matched rival models |

**Net effect.** The corrections make PE stricter: they exclude saddles, uncoupled systems, own-constraint cases and conservative systems. They do not rescue any case that failed the review. The gradient signature is no longer a definition and survives only as a corollary.

The companion validation report audits every result here. It records which parts are new, which are borrowed from established mathematics, and which remain unproven.

## 2. Setting and standing assumptions

The theory applies to systems made of identifiable components plus an identifiable, removable enforcement mechanism. Five assumptions define that setting; each theorem lists which ones it uses.

**A1. Components.** The state is x = (x₁, …, xₙ) with xᵢ ∈ R^{nᵢ}. Each block belongs to one component; N ≥ 1.

**A2. Admissible set.** A = A\_own ∩ S, where:

- A\_own = A₁ × … × Aₙ, each Aᵢ closed and convex. These are the component's own limits, such as capacity or non-negativity.
- S is closed and convex: the shared constraints, such as a common budget.
- Constraint qualification: the relative interiors of A\_own and S intersect. Then the normal cone splits as N\_A(x) = N\_own(x) + N\_S(x).

**A3. Mechanism decomposition fixed by intervention.** There is a physically specified enforcement mechanism M (coupling forces, a regulator, a controller, a planner, a market rule, the shared constraints S). Removing M is an admissible experiment. Then:

```latex
\text{actual: } \dot x = G(x) := \Pi_{T_A(x)}\big[v(x) + e(x)\big], \qquad \text{released: } \dot x = \Pi_{T_{A_{own}}(x)}\big[v(x)\big]
```

Here v is the intrinsic drive (what the components do on their own), e is the force M exerts, and T\_K(x) is the tangent cone of K at x. Both v and e are locally Lipschitz on an open set containing A. When A = Rⁿ, this reads G = v + e.

**A4. Smoothness.** Where stated, v, e or G are C¹ or C² near the point considered.

**A5. System objective (optional).** F : Rⁿ → R is C¹ or C² and is used only as a certificate (section 5), never to define pressure.

**Why A3 is substantive, not a relabelling.** v and e are not chosen by the modeller. They are fixed by what the components do when M is actually removed. A3 is also a scope restriction: PE says nothing about systems where no removable mechanism can be identified, such as pure multi-objective optimization (review test system 2). Different physical mechanisms give different v; that is a fact about the system, like the choice of which constraints to dualize in Lagrangian duality.

**Well-posedness (borrowed).** For a closed convex A and a Lipschitz field, the projected dynamics have unique absolutely continuous solutions. This is standard theory of projected dynamical systems and differential inclusions (Nagurney and Zhang 1996; Aubin and Cellina 1984; cited from memory, verify before citing).

## 3. Local pressure

Local pressure is the initial velocity components show the moment the enforcement mechanism is removed. It is defined from the released dynamics alone, so no choice of objective functions can change it.

**Definition 3.1 (local pressure).** Under A1–A3:

```latex
\ell(x) := \Pi_{T_{A_{own}}(x)}\big[v(x)\big], \qquad \ell_i(x) = \Pi_{T_{A_i}(x_i)}\big[v_i(x)\big], \qquad P_L(x) := \lVert \ell(x) \rVert
```

The componentwise form holds because, for a product of closed convex sets, the tangent cone is the product of the tangent cones and projection onto a product cone acts block by block (borrowed: standard convex analysis).

**Lemma 3.2 (release lemma).** Assume A1–A3, v is continuous, and x\* ∈ int A\_own. Let x(t) solve the released dynamics with x(0) = x\*. Then:

```latex
\lim_{t \to 0^+} \frac{x(t) - x^*}{t} = \ell(x^*) = v(x^*), \qquad \Big\lVert \frac{x(t)-x^*}{t} - \ell(x^*) \Big\rVert \le \tfrac{L}{2}\,P_L\, t\, e^{Lt}
```

The bound needs v to be L-Lipschitz on the path.

*Proof.* Near x\*, the released dynamics are the ODE ẋ = v(x), so x is C¹ with x′(0) = v(x\*). For the bound, write x(t) − x\* − tv(x\*) as the integral from 0 to t of \[v(x(s)) − v(x\*)\] ds, so its norm is at most L times the integral of ‖x(s) − x\*‖. The drift satisfies ‖x(s) − x\*‖ ≤ ∫₀ˢ (P\_L + L‖x(r) − x\*‖) dr. Grönwall's inequality then gives ‖x(s) − x\*‖ ≤ (P\_L/L)(e^{Ls} − 1) ≤ P\_L s e^{Ls}. Integrating gives the bound. ∎

If x\* lies on the boundary of A\_own, the same limit equals the projected drive. That uses the known fact that solutions of projected dynamical systems have right derivative Π\_T\[v\] (borrowed, cited from memory: Cornet 1983; Nagurney and Zhang 1996). It is not re-proved here.

**Measurement protocol.** Pressure is observable without knowing any objective function:

1. Bring the system to the equilibrium x\*.
2. Remove M for a short time δ and record the displacement Δx of each component.
3. Estimate ℓ(x\*) ≈ Δx/δ. By Lemma 3.2 the error is at most (L/2)P\_L δ e^{Lδ}.
4. Repeat to average out noise. Or, equivalently by Theorem 7.1, measure the force M exerts at x\* directly.

**Proposition 3.3 (what ℓ does and does not depend on).** ℓ is unchanged by any rewriting of F, any regrouping of terms between “local” and “interaction” parts, and any relabelling that leaves (v, M) fixed. It does depend on which mechanism M is removed.

*Proof.* Definition 3.1 involves only v and A\_own, and both are fixed by the system together with the choice of M. ∎

So the review's relabelling counterexample C5 is no longer possible. What remains is relativity to the mechanism. A regulated room is strong PE with respect to its heater controller, but not necessarily with respect to its insulation. Every PE claim must therefore name its M.

## 4. Constraints and admissible directions

A component's own limits belong to the component, so they shape its pressure. Shared limits belong to the enforcement mechanism, so their reaction forces count as enforcement. This split is what keeps a single box constraint from producing “strong PE”.

**Theorem 4.1 (projected equilibria).** Let K be closed and convex, x ∈ K, and w ∈ Rⁿ. Then:

```latex
\Pi_{T_K(x)}[w] = 0 \iff w \in N_K(x)
```

Here N\_K(x) = {n : nᵀ(y − x) ≤ 0 for all y ∈ K}, the polar cone of T\_K(x).

*Proof.* (⇐) Let w ∈ N\_K(x) = T\_K(x)°. For every t ∈ T\_K(x), wᵀt ≤ 0, so ‖w − t‖² = ‖w‖² − 2wᵀt + ‖t‖² ≥ ‖w‖² = ‖w − 0‖². Hence 0 is the nearest point of the cone, so Π\_T\[w\] = 0. (⇒) If Π\_T\[w\] = 0, the projection's variational inequality gives (w − 0)ᵀ(t − 0) ≤ 0 for all t ∈ T, so w ∈ T° = N\_K(x). ∎

**Corollary 4.2 (equilibrium condition).** Under A2–A3, x\* ∈ A is an equilibrium of G if and only if:

```latex
v(x^*) + e(x^*) \in N_A(x^*) = N_{own}(x^*) + N_S(x^*)
```

*Proof.* Apply Theorem 4.1 with K = A and w = v + e. The normal-cone sum rule uses the constraint qualification in A2 (borrowed: standard convex analysis). ∎

**Interpretation.** At an equilibrium, the combined drive v + e is balanced by reaction forces n\_own ∈ N\_own and n\_S ∈ N\_S:

- n\_own comes from the component's own limits. Projection already removes it from ℓ.
- n\_S comes from shared constraints. It is part of the enforcement: the mechanism's total force at x\* is e(x\*) − n\_S.

**Corollary 4.3 (link to KKT, borrowed).** If every Aᵢ and S is written as smooth convex inequalities gⱼ ≤ 0 satisfying Slater's condition, then N\_A(x\*) is the set of combinations Σμⱼ∇gⱼ(x\*) with μⱼ ≥ 0 and μⱼ gⱼ(x\*) = 0. Corollary 4.2 then reads as the KKT stationarity conditions with multipliers μ. The shared-constraint multipliers are exactly the enforcement reactions.

**Effect on the review's counterexample C4.** For one variable with F = −(x − 2)² on A = A₁ = \[0, 1\], there is no mechanism and no shared constraint. At x\* = 1, T\_{A₁}(1) = (−∞, 0\] and v(1) = 2, so ℓ(1) = Π\[2\] = 0. The case is classified as uncoupled, not strong PE. The own-versus-shared split was motivated by C4. It rests on an independent principle, that a component's own limits are not a system-level counterforce, and it excludes cases rather than admitting new ones. The validation report still flags it as a definitional choice to scrutinize.

## 5. How the system objective F relates to the dynamics G

F is admitted only as a certificate: a function the actual dynamics never decrease. When G is gradient-like in F, the author's original signature comes back as a theorem, with each component's objective now identified from its observed behaviour.

**Definition 5.1 (system objective).** F is a system objective for G on A if, for all x in A:

- ∇F(x)ᵀG(x) ≥ 0, and
- equality holds only where G(x) = 0.

Along solutions F is non-decreasing, and strictly increasing away from equilibria.

**Theorem 5.2 (gradient-like dynamics; borrowed).** Under A2 and A5 (C¹), let G(x) = Π\_{T\_A(x)}\[∇F(x)\]. Then:

1. F is a system objective for G.
2. x\* is an equilibrium of G if and only if ∇F(x\*) ∈ N\_A(x\*), the first-order stationarity condition of max F on A.

*Proof.* Moreau decomposition: any w splits as w = Π\_T w + Π\_N w with (Π\_T w)ᵀ(Π\_N w) = 0, where T and N are polar cones. So wᵀΠ\_T w = ‖Π\_T w‖². With w = ∇F, this gives ∇FᵀG = ‖G‖² ≥ 0, with equality iff G = 0. Part 2 is Theorem 4.1 with w = ∇F. ∎

A constant positive-definite metric P works the same way once projection uses the P⁻¹ inner product (borrowed).

**Theorem 5.3 (recovering the original signature).** Assume A = Rⁿ, G = ∇F (C¹), and that removing M leaves each component ascending its own payoff, vᵢ = ∇ₓᵢ uᵢ for C¹ functions uᵢ identified by the release experiment. At any equilibrium x\*:

```latex
\nabla F(x^*) = 0, \qquad \ell(x^*) = \big(\nabla_{x_i} u_i(x^*)\big)_i, \qquad e(x^*) = -\ell(x^*)
```

In particular, under the manuscript's form F = Σ fᵢ(xᵢ) − I with uᵢ = fᵢ: e = −∇I, and ℓ(x\*) = ∇I(x\*). The manuscript's Prop. 12.1 is recovered.

*Proof.* G(x\*) = ∇F(x\*) = 0. In the interior, ℓ = v by Definition 3.1. Since G = v + e, e(x\*) = G(x\*) − v(x\*) = −ℓ(x\*). Under the manuscript's form, ∇F = (fᵢ′) − ∇I and v = (fᵢ′), so e = −∇I, and stationarity gives ℓ = ∇I. ∎

**Theorem 5.4 (stability from F; borrowed).** Under A = Rⁿ and G C¹, suppose F is a system objective and x\* is a strict local maximum of F. Then:

- x\* is Lyapunov stable, with Lyapunov function V = F(x\*) − F.
- If x\* is also an isolated equilibrium, it is asymptotically stable (LaSalle's invariance principle).
- If G = ∇F and the Hessian of F at x\* is negative definite, x\* is exponentially stable.

**What F does not do.** F never defines pressure, and the signature is not a definition. If G is not gradient-like, F plays no role: the definitions in section 6 use G and v alone, and the non-improvement condition S4 is dropped because no F exists to improve.

## 6. Definitions

Every stable equilibrium is classified, relative to a named mechanism M, as exactly one of three types: strong PE (the mechanism holds components against nonzero pressure), weak PE (the mechanism is active nearby but pressure vanishes), or uncoupled. Dynamic PE extends this to attracting sets the mechanism is needed to sustain.

**Stability notions (relative to A; standard).** Let x(t; x₀) solve ẋ = G(x) with x₀ ∈ A, and let x\* be an equilibrium.

- *Lyapunov stable:* for every ε > 0 there is δ > 0 such that ‖x₀ − x\*‖ < δ implies ‖x(t; x₀) − x\*‖ < ε for all t ≥ 0.
- *Asymptotically stable:* Lyapunov stable, and x(t; x₀) → x\* for all x₀ in some neighbourhood. The basin B(x\*) is the set of all such x₀ in A.
- *Exponentially stable:* ‖x(t; x₀) − x\*‖ ≤ c e^{−αt} ‖x₀ − x\*‖ near x\*, for some c, α > 0.

**Definition 6.1 (strong PE with respect to M).** x\* ∈ A is a strong PE if:

1. (S1) Equilibrium: G(x\*) = 0.
2. (S2) Persistent local pressure: ℓ(x\*) ≠ 0.
3. (S3) Stability: x\* is asymptotically stable. If it is only Lyapunov stable, call it a *marginal* strong PE.
4. (S4) Non-improvement, imposed only when a system objective F is specified: for some δ > 0 and all t ∈ (0, δ), F(Π\_A(x\* + tℓ(x\*))) ≤ F(x\*).

**Definition 6.2 (weak PE).** x\* satisfies S1 and S3 with ℓ(x\*) = 0, and M is not inert near x\*: no neighbourhood U of x\* exists on which G agrees with the released dynamics on U ∩ A.

**Definition 6.3 (uncoupled equilibrium).** x\* satisfies S1 and S3, and G agrees with the released dynamics on some neighbourhood of x\* in A.

**Proposition 6.4 (the classes are exhaustive and exclusive).** Assume A1–A3 and that every point of A lies in int A\_own. Let x\* be an asymptotically stable equilibrium at which S4 holds whenever an F is specified. Then x\* is exactly one of strong PE, weak PE, or uncoupled.

*Proof.* If ℓ(x\*) ≠ 0, then x\* is strong. It is not uncoupled: by Theorem 7.1, M exerts the force −ℓ(x\*) ≠ 0 at x\*, so G differs from the released dynamics at x\* itself. If ℓ(x\*) = 0, Definitions 6.2 and 6.3 split on whether M is inert near x\*, which is a dichotomy. ∎

When own constraints are active at x\*, exclusivity of “strong” versus “uncoupled” still holds by the same argument with projections. Exhaustiveness is unaffected.

**Definition 6.5 (dynamic PE).** A nonempty compact set K ⊆ A is a dynamic PE with respect to M if:

1. K is forward invariant and asymptotically stable as a set under G.
2. (D1) Enforcement-sustained: K is not forward invariant under the released dynamics. Some point of K leaves K when M is removed.

It is a *strong* dynamic PE if additionally:

3. (D2) Persistent pressure: for every x₀ ∈ K, the long-run average of Pₗ(x(t; x₀)) is positive.

```latex
\liminf_{T\to\infty} \frac{1}{T}\int_0^T P_L\big(x(t;x_0)\big)\,dt > 0
```

The author's region E\_PE = {C(x) ≤ ε} remains a way to propose K, but it counts as a dynamic PE only if it meets 1 and D1. D1 is what stops every conservative or merely bounded system from qualifying.

## 7. Core theorems

Six results carry the theory:

- **Balance (7.1):** local pressure equals minus the enforcement load.
- **Necessity (7.2):** strong PE needs active enforcement, with no exceptions.
- **Gradient case (7.3):** condition S4 is automatic.
- **Lapse response (7.4):** how far the state drifts, and how much F is lost, while enforcement fails.
- **Critical lapse (7.5):** bounds on the longest failure the system survives.
- **Information (7.6):** that failure tolerance cannot be computed from G alone.

All proofs are complete under the stated assumptions. Throughout, φ^v\_t(x₀) is the solution of ẋ = v(x) at time t from x₀, and B is the basin of x\* under G.

### Theorem 7.1 (balance)

Assume A1–A3 and let x\* be an equilibrium with x\* ∈ int A\_own. Then for some reaction n\_S ∈ N\_S(x\*):

```latex
\ell(x^*) = -\big(e(x^*) - n_S\big), \qquad P_L(x^*) = \lVert e(x^*) - n_S \rVert
```

Local pressure is exactly balanced by the enforcement load: the mechanism's force plus the shared-constraint reaction.

*Proof.* In the interior, N\_own(x\*) = {0} and T\_own = Rⁿ, so ℓ(x\*) = v(x\*). Corollary 4.2 gives v + e = n\_S for some n\_S ∈ N\_S(x\*). Rearrange. ∎

The manuscript's Prop. 12.1 is the special case S = Rⁿ, e = −∇I (Theorem 5.3).

### Theorem 7.2 (no enforcement, no strong PE)

Assume A1–A3. If M is inert on a neighbourhood of an equilibrium x\*, meaning G agrees there with the released dynamics, then ℓ(x\*) = 0. This holds whether or not own constraints are active.

*Proof.* G(x\*) = Π\_{T\_own(x\*)}\[v(x\*)\] = ℓ(x\*) by Definition 3.1, and G(x\*) = 0. ∎

This is the corrected Prop. 13.1. Strong PE requires a mechanism exerting nonzero force at x\*, and the review's counterexample C4 is no longer an exception (section 4).

### Theorem 7.3 (condition S4 is automatic in the gradient case)

Assume A = Rⁿ, G = ∇F with F C², and let x\* be a critical point with Hessian H negative definite. Then S1 and S3 hold (exponential stability), and S4 holds for every direction, in particular d = ℓ(x\*).

*Proof.* S1: G(x\*) = 0. S3: the linearization is ẏ = Hy, and H has only negative eigenvalues. S4: by Taylor's theorem, F(x\* + td) = F(x\*) + (t²/2) dᵀHd + o(t²) < F(x\*) for small t ≠ 0 and any d ≠ 0. ∎

The author's condition 5 therefore adds content only off the gradient class or at degenerate points.

### Theorem 7.4 (response to an enforcement lapse)

Assume A = Rⁿ, x\* is an equilibrium of G, and v is C¹ and L-Lipschitz on a neighbourhood containing the lapse path. If M fails on \[0, τ\], the state follows x(t) = φ^v\_t(x\*). Then:

```latex
\text{(a)}\quad \big\lVert x(\tau) - x^* - \tau\,\ell(x^*) \big\rVert \le \rho(\tau) := P_L\Big(\frac{e^{L\tau}-1}{L} - \tau\Big) = \tfrac{L}{2}P_L\tau^2 + O(\tau^3)
```

```latex
\text{(b)}\quad x(\tau) = x^* + \tau\,\ell + \tfrac{\tau^2}{2}\,Dv(x^*)\,\ell + O(\tau^3) \quad (v \in C^2)
```

```latex
\text{(c)}\quad F(x(\tau)) - F(x^*) = \tfrac{\tau^2}{2}\,\ell^{\top} H\, \ell + O(\tau^3) \quad (F \in C^2,\ \nabla F(x^*) = 0,\ H = \nabla^2 F(x^*))
```

*Proof.*

- (a) As in Lemma 3.2, ‖x(t) − x\*‖ ≤ (P\_L/L)(e^{Lt} − 1). So ‖x(τ) − x\* − τℓ‖ ≤ L∫₀^τ ‖x(s) − x\*‖ ds ≤ P\_L((e^{Lτ} − 1)/L − τ).
- (b) Here x′ = v(x) and x″ = Dv(x)v(x), with x(0) = x\* and x′(0) = ℓ. Apply Taylor's theorem to x(τ).
- (c) Write Δ = x(τ) − x\* = τℓ + O(τ²). Then F(x\* + Δ) = F(x\*) + ∇FᵀΔ + ½ΔᵀHΔ + O(‖Δ‖³). The linear term vanishes, and ½ΔᵀHΔ = (τ²/2)ℓᵀHℓ + O(τ³). ∎

### Theorem 7.5 (critical lapse duration)

Let τ\_c = inf{τ ≥ 0 : φ^v\_τ(x\*) ∉ B}, with τ\_c = ∞ if this never happens. Let ℓ̂ = ℓ/P\_L, and let d\_B = sup{s : x\* + rℓ̂ ∈ B for all r < s} be the basin distance along the pressure direction. Assume the cone conditions: for some κ > 0,

- dist(x\* + rℓ̂, Rⁿ \\ B) ≥ κ(d\_B − r) for r ∈ \[0, d\_B\], and
- dist(x\* + rℓ̂, B) ≥ κ(r − d\_B) for r ∈ \[d\_B, d\_B + r₀\].

Then:

1. If L = 0 (constant drive), τ\_c = d\_B/P\_L exactly.
2. In general, τ₋ ≤ τ\_c ≤ τ₊, where τ₋ solves κ(d\_B − P\_Lτ) = ρ(τ) and τ₊ solves κ(P\_Lτ − d\_B) = ρ(τ), whenever a solution exists with P\_Lτ₊ ≤ d\_B + r₀.
3. Consequently:

```latex
\tau_c = \frac{d_B}{P_L}\Big(1 + O\big(\tfrac{L\,d_B}{\kappa\,P_L}\big)\Big)
```

*Proof.*

- (1) With L = 0, x(t) = x\* + tℓ exactly, and the definition of d\_B gives the result.
- (2) Lower bound: for s ≤ τ < τ₋, the ray point x\* + sℓ is at distance at least κ(d\_B − P\_L s) ≥ κ(d\_B − P\_Lτ) > ρ(τ) ≥ ρ(s) from the complement of B. By Theorem 7.4(a), x(s) lies within ρ(s) of that point, so x(s) ∈ B. Upper bound: at τ₊, x\* + τ₊ℓ is at distance ≥ ρ(τ₊) from B, so x(τ₊) ∉ B and τ\_c ≤ τ₊.
- (3) Near τ ≈ d\_B/P\_L, ρ ≈ L d\_B²/(2P\_L). Solving the linear equations gives |τ\_c − d\_B/P\_L| ≤ ρ/(κP\_L) + higher order. ∎

### Theorem 7.6 (information beyond G)

Assume A = Rⁿ and let x\* be an asymptotically stable equilibrium of G whose basin has d\_B(u) < ∞ along some unit direction u. For any p > 0, there are mechanism decompositions G = v₁ + e₁ = v₂ + e₂ with τ\_c⁽¹⁾ = ∞ and τ\_c⁽²⁾ = d\_B(u)/p.

Hence no resilience measure computed from G alone can determine the tolerance to enforcement failure. That includes Jacobian spectra, basin size or shape, and Lyapunov functions.

*Proof.* Take v₁ = 0: the state never moves during a lapse, so τ\_c = ∞. Take v₂ = pu, constant: by Theorem 7.5(1), τ\_c = d\_B(u)/p. Set eₖ = G − vₖ. ∎

**Numerical check.** For G(x) = −kx + x³ componentwise, with k = (1, 2), the basin is the box |x₁| < 1, |x₂| < √2. With v = c = (1.5, 0.5), simulation gives τ\_c = 0.667, equal to d\_B/P\_L = 1.054/1.581 = 0.667. With v = 0 the system never fails, and with v = 2c, τ\_c = 0.333. All three share the same G.

## 8. The distinct prediction: the enforcement-failure law

PE's one candidate for a distinct, falsifiable claim concerns a single kind of disturbance: failure of the enforcement mechanism. Tolerance to that failure is set by local pressure and the basin distance along its direction, τ\_c ≈ d\_B(ℓ̂)/P\_L. Tolerance to ordinary state disturbances is not.

**Predictions**

1. **Lapse law.** In the pressure-dominated regime (L·d\_B/(κP\_L) small), the critical enforcement-lapse duration is τ\_c ≈ d\_B(ℓ̂)/P\_L (Theorem 7.5). Across equilibria and systems, tolerance to enforcement failure ranks by d\_B(ℓ̂)/P\_L, not by measures computed from G.
2. **Dissociation.** P\_L carries no information about tolerance to random state kicks beyond basin size and Jacobian spectrum. PE is a theory of mechanism-failure fragility, not of resilience in general.
3. **Loss law.** A short lapse lowers the system objective by (τ²/2)ℓᵀHℓ to leading order (Theorem 7.4c). The leading cost is quadratic in local pressure.

**What would falsify it.** Any one of these counts against PE:

- In systems meeting A1–A4, measured τ\_c does not track d\_B(ℓ̂)/P\_L, for example with a Spearman correlation no better than G-based measures.
- A measure computed from G alone predicts lapse tolerance as well as d\_B(ℓ̂)/P\_L.
- P\_L predicts kick tolerance as well as basin measures do. That would mean P\_L is merely a proxy for ordinary stability.

**Test on a random family.** I simulated 80 two-dimensional systems G(x) = −kx + x³ + g(x₂², x₁²), with released drive v(x) = c − βx and random k, g, c, β. Each system had a lapse test and a random-kick test. The validation report gives the full method.

| Predictor | Correlation with lapse tolerance τ\_c | Correlation with kick tolerance |
| --- | --- | --- |
| d\_B(ℓ̂)/P\_L (PE) | 0.91 | 0.20 |
| 1/P\_L alone | 0.81 | −0.03 |
| Jacobian stability margin | 0.20 | 0.92 |
| Isotropic basin radius | 0.20 | 0.92 |

All values are Spearman rank correlations. The pattern is the predicted double dissociation. Among the systems that did fail, the median relative error of d\_B/P\_L as a point estimate of τ\_c was 22%. In 36% of systems the released drive settled inside the basin, and they never failed, which d\_B/P\_L does not foresee. That is the main limitation of the first-order law.

**How distinct is this?** Theorem 7.6 guarantees that G-based measures cannot capture lapse tolerance, so their loss here is expected, not a discovery. The PE-specific content is narrower: one scalar law, d\_B(ℓ̂)/P\_L, with proved error bounds, and the claim that it ranks systems well. Closely related prior work exists:

- Connective stability of interconnected systems (stability under disconnection of interconnections; Šiljak, 1978).
- Fault-tolerant control.
- Shadow prices in constrained optimization, where P\_L equals the multiplier norm.

These are cited from memory; verify before citing. The validation report weighs this overlap.

## 9. Worked examples

Under the new definitions, the manuscript's own model is a strong PE relative to its coupling. Saddles, isolated own-limit cases and conservative systems no longer qualify. The examples use the review's numbers: a = 1, b = −1, λ = 1.

| Example | Mechanism M | Equilibrium | ℓ(x\*) | Class |
| --- | --- | --- | --- | --- |
| Manuscript model, planner dynamics G = ∇F | Coupling force −∇I (planner) | (0.333, −0.333) | (1.33, −1.33) | Strong PE; S4 automatic (Theorem 7.3) |
| Same agents, each bearing half the coupling cost (Nash) | None removable | (0.5, −0.5) | 0 | Uncoupled |
| Same Nash system | The physical coupling itself | (0.5, −0.5) | (1.0, −1.0) | Strong PE |
| Shared budget x + y ≤ 1, a = b = 2 | Budget constraint S | (0.5, 0.5) | (3, 3), P\_L = 4.24 | Strong PE; P\_L = multiplier 3 × ‖(1, 1)‖ |
| One variable on \[0, 1\], F = −(x − 2)² (C4) | None | 1 | 0 (projected) | Uncoupled |
| Anti-coupled saddle (C1) | Coupling | (−1, 1) | (4, −4) | Not PE: S3 fails |
| Double wells + coupling (test system 5) | Coupling 0.3(x − y)² | (1, 1), (−1, −1) | 0 | Weak PE (coupling active nearby) |
| Same | Same | (0.837, −0.837) and mirror | ±(1.00, −1.00) | Strong PE |
| Same | Same | 4 saddles | nonzero | Not PE: S3 fails |
| Lossless exchange (test system 7) | None identifiable | cycle | not defined | Not dynamic PE: D1 needs a mechanism |

**The manuscript model in detail.** Here G = ∇F and v = (−2(x − a), −2(y − b)), so e = −∇I = (−2λ(x − y), 2λ(x − y)). At x\*, e = (−1.33, 1.33) = −ℓ, as Theorem 7.1 requires. The Hessian has eigenvalues −2 and −6, so x\* is exponentially stable.

When the coupling lapses, components relax toward their own optima (1, −1), which lie inside the global basin of this linear system. So τ\_c = ∞: the system always recovers, and only the loss law applies.

| Lapse τ | Exact loss in F | Predicted (τ²/2)ℓᵀHℓ | Relative error |
| --- | --- | --- | --- |
| 0.01 | −0.00105 | −0.00107 | 2% |
| 0.05 | −0.0242 | −0.0267 | 10% |
| 0.10 | −0.0876 | −0.107 | 22% |
| 0.30 | −0.543 | −0.960 | 77% |

The error grows linearly in τ, as the O(τ³) remainder predicts. The law is a short-lapse approximation only.

**Relativity to the mechanism.** The Nash rows show the same equilibrium classified two ways. Relative to a planner, none is present, so it is uncoupled. Relative to the physical coupling, it is strong PE, because removing the coupling makes agents move. Both answers are correct for their M. A PE claim that names no M is incomplete.

## 10. Scope and limitations

The reconstructed theory is well-posed and internally consistent, but it is narrow. It applies to systems with a removable mechanism, it is relative to that mechanism, and its one distinct prediction concerns mechanism failure only.

- **Scope.** The theory needs a physically removable mechanism M (A3). Pure multi-objective optimization, systems with no identifiable enforcement, and purely conservative dynamics are outside it.
- **Relativity.** Classifications hold relative to a named M. Different mechanisms on the same system can give different answers, and the theory does not say which M is “the” right one.
- **Measurement.** Measuring ℓ needs a release experiment or a direct measurement of the mechanism's force. In many real systems (ecosystems, organizations) a clean release is impractical. There ℓ must be inferred from a model, which brings back modelling choices.
- **Mathematics not covered.**
  - The balance theorem (7.1) and the lapse results (7.4–7.6) are proved for interior points with respect to own constraints.
  - Boundary cases rely on borrowed results about projected dynamical systems.
  - Theorem 7.5 needs cone conditions on the basin; these are not checked automatically.
- **Prediction limits.**
  - The lapse law is first order. It misses cases where the released drive settles inside the basin, which was 36% of the test family.
  - It has not been tested on any real system.
  - Its distinctness from connective stability and fault-tolerance analysis is partial.
- **What is not claimed.** No universal law, no new equilibrium concept in classical mathematics, and no cross-domain empirical result. The theory is a precise framework for one question: how much does a system lean on its enforcement, and what happens when that fails?

The companion validation report sorts every result into proved here, borrowed, elementary, or unproven, and gives the full experiment.