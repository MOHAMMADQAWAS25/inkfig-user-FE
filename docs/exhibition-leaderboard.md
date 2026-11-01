# Exhibition leaderboard UI

Every exhibition toolbar links to `/:language/exhibition/:exhibitionId/leaderboard`.
Public read-only standings show rank, contained thumbnail, title, creator/avatar,
category, average to two decimals and counted votes. English/Arabic copy,
logical spacing, theme tokens, keyboard buttons and responsive rows are supported.
The backend filters zero-vote entries and ranks before pagination; the client
does not filter an incomplete batch or recompute ranks.

Twenty rows per request, Load more appends server order with ID deduplication.
Refresh resets to page one. No focus/reconnect polling or automatic reorder.
Loading/error/retry, upcoming, voting-open/closed and genuine no-votes states are
provided. Last fetched is the latest page's server timestamp. Live offset pages
can skip moved rows between requests; Refresh obtains current standings again.

Artwork rows open the shared ExhibitionArtworkPopup, keeping the page/list and
scroll underneath. Deliberately omit exhibitionId/rating/votingOpen props so
the popup has no star voting controls on this route. Existing like/save/report
permissions and image interaction protection remain. Voting stays in the gallery.

No changes to existing gallery order, homepage cards, ratings writes or schema.
Deploy companion backend first. Baselines main-system3162130/user-FE7d0f78a;
matching feature/exhibition-leaderboard branch. To roll back, revert the frontend
ticket commit before backend using git revert and retain historical log entries.
