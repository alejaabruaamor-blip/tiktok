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
- Enable the upsell payment action when offers are selected, preserving selected IDs across the existing delivery form when customer details are missing so direct visitors can complete their purchase.
