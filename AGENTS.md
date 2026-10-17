<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep post-purchase offer interactions isolated in UpsellMirror while retaining the captured markup, so unrelated mirrored pages stay unchanged.
- Use the server-validated upsell catalog for additional-item Pix totals; accept only unique offer IDs, never browser-provided amounts.
- Display upsell Pix inline in UpsellMirror, retaining the standalone payment route for compatibility, and navigate to order confirmation only when BravoPay reports PAID so payment never loops back to the upsell.
- Keep a session-scoped paid-order receipt with an immutable initial shipping snapshot; generate upsell Pix without a second address form and append payment snapshots only after PAID, deduplicated by transaction ID, so pending or repeated checks never add unpaid or duplicate items.
- Render confirmation from the paid-order receipt while retaining the mirrored shell, so the displayed items, total and shipping match the confirmed purchase.
