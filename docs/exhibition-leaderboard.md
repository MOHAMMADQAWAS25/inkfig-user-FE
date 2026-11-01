# Exhibition leaderboard UI

Every exhibition toolbar links to `/:language/exhibition/:exhibitionId/leaderboard`.
Public read-only standings show rank, contained thumbnail, title, creator/avatar,
category, average to two decimals and counted votes. English/Arabic copy,
logical spacing, theme tokens, keyboard buttons and responsive rows are supported.
The backend filters zero-vote entries and ranks before pagination; the client
does not filter an incomplete batch or recompute ranks.

Twenty rows per request, Load more appends server order with ID deduplication.
Category selection sends type_id to the backend before ranking/pagination and
uses separate query pages per category. No manual Refresh button, focus/reconnect
polling or automatic reorder. The shared toolbar retains Exhibitions, Leaderboard,
Participate and My submissions, with existing sign-in/participation restrictions.
Loading/error/retry, upcoming, voting-open/closed and genuine no-votes states are
provided. Open voting displays “It becomes more exciting” (localized in Arabic);
ranking guidance and the fetch timestamp are not displayed. Live offset pages
can skip moved rows between requests; reopening the page obtains current standings.
The page uses the available width with balanced side gutters. Decorative stars
fill proportionally to the numeric average, including half and other fractions.

Artwork rows open the shared ExhibitionArtworkPopup, keeping the page/list and
scroll underneath. Deliberately omit exhibitionId/rating/votingOpen props so
the popup has no star voting controls on this route. Existing like/save/report
permissions and image interaction protection remain. Voting stays in the gallery.

No changes to existing gallery order, homepage cards, ratings writes or schema.
Deploy companion backend first. Baselines main-system3162130/user-FE7d0f78a;
matching feature/exhibition-leaderboard branch. To roll back, revert the frontend
ticket commit before backend using git revert and retain historical log entries.
