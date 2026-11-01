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
