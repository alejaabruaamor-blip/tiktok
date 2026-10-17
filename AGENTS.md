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
- Keep upsell Pix in its existing dedicated route and navigate to order confirmation only when BravoPay reports PAID, so it never loops back to the upsell.
