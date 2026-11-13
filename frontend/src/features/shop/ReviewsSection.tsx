import { AnimatePresence, motion } from 'framer-motion'
import { Star } from 'lucide-react'
import { useId, useState, type FormEvent } from 'react'
import { Link, useLocation } from 'react-router'
import { ApiError } from '../../api'
import type { Review } from '../../api/types'
import { useAuth } from '../../auth/useAuth'
import { Button, Figure } from '../../components/ui'
import { Notice } from '../../components/ui/Notice'
import { useShopReviews, useSubmitReview } from '../../data/reviews'
import { color } from '../../design/tokens'
import { transition } from '../../design/motion'
import { cx } from '../../lib/cx'
import { formatDate, formatRating } from '../../lib/format'
import { EmptyState } from '../../components/ui/EmptyState'
import { inputBox } from '../../components/ui/inputStyles'

const STEP = 8

interface Props {
  shopId: number
  averageRating: number | null
  reviewCount: number | null
}

export function ReviewsSection({ shopId, averageRating, reviewCount }: Props) {
  const reviews = useShopReviews(shopId)
  const [visible, setVisible] = useState(STEP)

  const data = reviews.data
  const total = data?.total ?? reviewCount ?? 0

  return (
    <div className="space-y-10">
      {/* Summary + breakdown */}
      <div className="grid grid-cols-[auto_1fr] items-center gap-8">
        <div>
          <p className="figures text-[60px] font-medium leading-none tracking-[-0.04em]">
            {formatRating(averageRating)}
          </p>
          <Figure tone="muted" className="mt-2 block text-[12px]">
            {total} {total === 1 ? 'review' : 'reviews'}
          </Figure>
        </div>
        <div className="space-y-1.5">
          {([5, 4, 3, 2, 1] as const).map((star) => {
            const count = data?.breakdown[star] ?? 0
            const base = data?.reviews.length || 1
            return (
              <div key={star} className="grid grid-cols-[14px_1fr_32px] items-center gap-3">
                <Figure tone="muted" className="text-[11px]">
                  {star}
                </Figure>
                <div className="h-[5px] overflow-hidden rounded-none bg-linen-deep">
                  <motion.div
                    className="h-full rounded-none bg-satin-deep"
                    initial={{ width: 0 }}
                    animate={{ width: `${(count / base) * 100}%` }}
                    transition={{ ...transition.slow, delay: (5 - star) * 0.05 }}
                  />
                </div>
                <Figure tone="muted" className="text-right text-[11px]">
                  {count}
                </Figure>
              </div>
            )
          })}
          {data && !data.complete && (
            <p className="pt-1 text-[11px] text-faint">Breakdown of the latest {data.reviews.length}.</p>
          )}
        </div>
      </div>

      <ReviewForm shopId={shopId} />

      {/* List */}
      <div>
        {reviews.isPending && <p className="text-[13px] text-muted">Loading reviews…</p>}
        {reviews.isError && <Notice>Couldn't load reviews.</Notice>}
        {data && data.reviews.length === 0 && (
          <EmptyState compact art="review" title="No reviews yet." body="Be the first to pull a shot." />
        )}
        <ul className="divide-y divide-line/80">
          <AnimatePresence initial={false}>
            {data?.reviews.slice(0, visible).map((review) => (
              <ReviewItem key={review.id} review={review} />
            ))}
          </AnimatePresence>
        </ul>
        {data && data.reviews.length > visible && (
          <Button variant="quiet" size="sm" className="mt-4" onClick={() => setVisible((v) => v + STEP)}>
            Show more reviews
          </Button>
        )}
      </div>
    </div>
  )
}

function ReviewItem({ review }: { review: Review }) {
  const name = [review.userFirstName, review.userLastName?.charAt(0)].filter(Boolean).join(' ')
  return (
    <motion.li
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0 }}
      transition={transition.base}
      className="py-5"
    >
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="flex size-8 items-center justify-center rounded-full bg-linen font-sans font-medium text-[14px]">
            {review.userFirstName?.charAt(0) ?? '·'}
          </span>
          <span className="text-[14px] font-medium">
            {name || 'Guest'}
            {review.userLastName && '.'}
          </span>
        </div>
        <Figure tone="muted" className="text-[11px]">
          {formatDate(review.createdAt)}
        </Figure>
      </div>
      <Stars value={review.rating} className="mt-3" />
      {review.comment && <p className="mt-2 text-[14px] leading-relaxed text-espresso/90">{review.comment}</p>}
    </motion.li>
  )
}

function Stars({ value, className }: { value: number; className?: string }) {
  return (
    <span className={cx('flex gap-0.5', className)} aria-label={`${value} out of 5`}>
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className="size-3.5"
          strokeWidth={1.5}
          color={i <= value ? color.satin : color.line}
          fill={i <= value ? color.satin : 'none'}
        />
      ))}
    </span>
  )
}

const RATING_WORDS = ['', 'Thin', 'Decent', 'Good', 'Great', 'Exceptional']

function ReviewForm({ shopId }: { shopId: number }) {
  const { isAuthenticated, role } = useAuth()
  const location = useLocation()
  const submit = useSubmitReview(shopId)
  const commentId = useId()
  const [rating, setRating] = useState(0)
  const [hover, setHover] = useState(0)
  const [comment, setComment] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [done, setDone] = useState(false)

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-between gap-4 rounded-md border border-line bg-card px-5 py-4">
        <p className="text-[14px] text-muted">Been here? Share how the cup was.</p>
        <Link
          to="/login"
          state={{ from: location.pathname + location.search }}
          className="shrink-0 text-[13px] font-medium underline decoration-espresso/40 decoration-1 underline-offset-4"
        >
          Sign in to review
        </Link>
      </div>
    )
  }
  // ReviewController: POST is USER-only
  if (role && role !== 'USER') return null

  if (done) {
    return (
      <Notice tone="info">
        <span className="text-open">Thanks. Your review is live.</span>
      </Notice>
    )
  }

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError(null)
    if (rating < 1 || rating > 5) return setError('Giving a rating is mandatory')
    if (comment.length > 1000) return setError("The comment can't be longer than 1000 characters")
    submit.mutate(
      { rating, comment: comment.trim() || undefined },
      {
        onSuccess: () => setDone(true),
        onError: (err) =>
          setError(
            err instanceof ApiError && err.isConflict
              ? "You've already reviewed this café."
              : err instanceof ApiError && err.isForbidden
                ? 'Only customer accounts can leave reviews.'
                : err.message,
          ),
      },
    )
  }

  const shown = hover || rating

  return (
    <form onSubmit={onSubmit} noValidate className="rounded-md border border-line bg-card p-5">
      <p className="eyebrow">Your review</p>

      <div className="mt-4 flex items-center gap-4">
        <div role="radiogroup" aria-label="Rating" className="flex gap-1" onMouseLeave={() => setHover(0)}>
          {[1, 2, 3, 4, 5].map((i) => (
            <motion.button
              key={i}
              type="button"
              role="radio"
              aria-checked={rating === i}
              aria-label={`${i} star${i > 1 ? 's' : ''}`}
              onClick={() => setRating(i)}
              onMouseEnter={() => setHover(i)}
              whileHover={{ scale: 1.15 }}
              whileTap={{ scale: 0.9 }}
              transition={transition.quick}
              className="p-0.5"
            >
              <Star
                className="size-6"
                strokeWidth={1.5}
                color={i <= shown ? color.satin : color.faint}
                fill={i <= shown ? color.satin : 'none'}
              />
            </motion.button>
          ))}
        </div>
        <span className="font-sans font-medium text-[16px] italic text-muted">{RATING_WORDS[shown]}</span>
      </div>

      <label htmlFor={commentId} className="sr-only">
        Comment
      </label>
      <textarea
        id={commentId}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        maxLength={1000}
        rows={3}
        placeholder="The crema, the room, the playlist… (optional)"
        className={`mt-4 w-full resize-none px-4 py-3 leading-relaxed ${inputBox}`}
      />
      <div className="mt-1 flex justify-end">
        <Figure tone={comment.length > 950 ? 'alert' : 'muted'} className="text-[11px]">
          {comment.length}/1000
        </Figure>
      </div>

      {error && (
        <div className="mt-3">
          <Notice>{error}</Notice>
        </div>
      )}

      <Button type="submit" size="sm" className="mt-4" loading={submit.isPending} disabled={rating === 0}>
        Publish review
      </Button>
    </form>
  )
}
