# Artwork exhibition badges

Shared WorkExhibitionBadge consumes backend `exhibitions` metadata, never guesses
membership from the current URL, artwork date or client approval flags. Approved,
started, unblocked participation only; past exhibitions retain badges. Year comes
from the exhibition event date in Asia/Hebron. Pending/rejected/future entries and
approved withdrawals are not advertised. No metadata means no badge markup.

Card badge: physical top-left in both languages, inside the artwork media. Hovering
anywhere on home/related, profile posts/likes/saved and exhibition artwork cards
reveals the badge. Keyboard media focus reveals it; touch/no-hover shows it without
requiring a tap. Absolute positioning/pointer-events:none preserves masonry size,
navigation and save controls. Theme tokens and reduced-motion supported.
Latest event year is shown with +N for additional distinct exhibitions; duplicate
IDs are removed. Details show all associated names/years with exhibition links
beneath the category. Existing artwork preview modal also supports detail badges.

Badges use ordinary code/icons, not the generated design-preview image. Existing
images, cropping, navigation, permissions and card dimensions remain unchanged.
Data follows existing cache refresh behavior; this is not a new realtime channel.

Deploy main-system companion backend first (no migration), frontend second.
Matching branches: `feature/artwork-exhibition-badges`. Frontend baseline
`aab22953bc3288d5da9ccb4214d8175b01a38c85`. Revert only frontend badge ticket commit
to remove the UI; revert backend companion afterward if required. Preserve prior
feature-log entries and unrelated changes; no reset/data rollback needed.

## Icon-only revision (2026-11-01)

Supersedes the earlier year/+N card treatment. Cards show only a 21px trophy inside
a 42px circular control, opposite the 21px save icon at top:12px; diameter follows
the existing save control's 38px size below600px. No visible text/year/count. Keep
localized accessible label. Exhibition gallery cards do not render the trophy.

Cards consume `has_exhibition` with fallback to older cached arrays; names/years
are selected only by the opened-artwork API. Details use separate bordered entries,
a localized label/year link and custom exhibition title on a separate line with
automatic text direction. A generic name such as Exhibition2026/معرض2026 is omitted
as redundant in both languages, preventing mixed-language duplicate badge labels.
Actual custom exhibition titles are user content, preserved without machine
translation; interface text follows the selected language. Link accessible name
separates label/year. Single-column entries wrap long names in both themes/RTL.

Revision branch `fix/lightweight-exhibition-badges`, frontend baseline `f91fa72`.
Backend first, frontend next; no migration. Revert only this revision's paired
commits to restore prior full card metadata/year badges. No data rollback.

## Named hover labels (2026-11-01)

Card badges now show the trophy and latest publicly eligible exhibition name in
a small translucent dark rectangle. Name comes from the existing latest-exhibition
rating summary, with older cached-array/localized fallback; no per-card request.
Width is bounded away from Save and long names ellipsize. Existing display-only
hover/keyboard/touch behavior and opened-detail metadata are retained. Deploy the
companion backend additive summary name before frontend; no migration required.
