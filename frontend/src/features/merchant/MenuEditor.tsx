import { AnimatePresence, motion } from 'framer-motion'
import { Pencil, Plus, Trash2 } from 'lucide-react'
import { useId, useMemo, useState } from 'react'
import type { MenuItem } from '../../api/types'
import { Button, Field } from '../../components/ui'
import { EmptyState } from '../../components/ui/EmptyState'
import { Notice } from '../../components/ui/Notice'
import { useRemoveMenuItem, useSaveMenuItem } from '../../data/merchant'
import { transition } from '../../design/motion'
import { formatPrice } from '../../lib/format'
import { useForm } from '../../lib/useForm'
import { rules, type Rule } from '../../lib/validation'

// Same limits as MenuItemRequestDTO
const price: Rule = (v) => {
  const n = Number(v.replace(',', '.'))
  if (!Number.isFinite(n) || n <= 0) return 'Price must be greater than 0'
  return /^\d{1,8}([.,]\d{1,2})?$/.test(v.trim()) ? null : 'Use up to 2 decimals, e.g. 14.50'
}

const itemSchema = {
  category: [rules.required('Category is required'), rules.maxLength(100)],
  name: [rules.required('Product name is required'), rules.maxLength(255)],
  price: [rules.required('Price is required'), price],
  description: [rules.maxLength(1000)],
}

// The café's menu, grouped by category, with add / edit / remove.
export function MenuEditor({ shopId, menu }: { shopId: number; menu: MenuItem[] }) {
  // null = closed, 'new' = add form, number = editing that item
  const [editing, setEditing] = useState<'new' | number | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<number | null>(null)
  const remove = useRemoveMenuItem(shopId)

  const categories = useMemo(() => {
    const map = new Map<string, MenuItem[]>()
    for (const item of menu) {
      const key = item.category.trim() || 'Other'
      map.set(key, [...(map.get(key) ?? []), item])
    }
    return [...map.entries()]
  }, [menu])

  const categoryNames = categories.map(([name]) => name)

  return (
    <div className="max-w-3xl">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <p className="text-[14px] text-muted">
          Customers see this menu on your café’s page. Prices are in lei.
        </p>
        {editing !== 'new' && (
          <Button variant="accent" icon={<Plus className="size-4" />} onClick={() => setEditing('new')}>
            Add item
          </Button>
        )}
      </div>

      <AnimatePresence initial={false}>
        {editing === 'new' && (
          <motion.div
            key="new"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={transition.base}
            className="overflow-hidden"
          >
            <MenuItemForm
              shopId={shopId}
              categories={categoryNames}
              onDone={() => setEditing(null)}
              className="mt-6"
            />
          </motion.div>
        )}
      </AnimatePresence>

      {remove.isError && (
        <div className="mt-6">
          <Notice>Couldn’t remove the item. Try again.</Notice>
        </div>
      )}

      {menu.length === 0 && editing !== 'new' ? (
        <div className="mt-8">
          <EmptyState art="cup" title="No menu yet." body="Add your first drink or pastry so customers know what you serve." />
        </div>
      ) : (
        categories.map(([category, items]) => (
          <section key={category} className="mt-10">
            <h3 className="eyebrow border-b border-line pb-2">
              {category} <span className="figures ml-1 text-faint">{items.length}</span>
            </h3>
            <ul className="divide-y divide-line/80">
              {items.map((item) =>
                editing === item.id ? (
                  <li key={item.id} className="py-3">
                    <MenuItemForm
                      shopId={shopId}
                      item={item}
                      categories={categoryNames}
                      onDone={() => setEditing(null)}
                    />
                  </li>
                ) : (
                  <li key={item.id} className="flex items-start gap-4 py-3.5">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-baseline gap-2">
                        <span className="font-display font-normal text-[24px] leading-snug">{item.name}</span>
                        <span className="mb-1 flex-1 border-b border-dotted border-faint/60" aria-hidden />
                        <span className="figures text-[13.5px] font-medium">{formatPrice(item.price)}</span>
                      </div>
                      {item.description && (
                        <p className="mt-1 text-[13px] leading-relaxed text-muted">{item.description}</p>
                      )}
                    </div>
                    <div className="flex shrink-0 items-center gap-1">
                      {confirmDelete === item.id ? (
                        <>
                          <Button
                            size="sm"
                            variant="danger"
                            loading={remove.isPending}
                            onClick={() =>
                              remove.mutate(item.id, { onSettled: () => setConfirmDelete(null) })
                            }
                          >
                            Remove
                          </Button>
                          <Button size="sm" variant="quiet" onClick={() => setConfirmDelete(null)}>
                            Keep
                          </Button>
                        </>
                      ) : (
                        <>
                          <button
                            type="button"
                            aria-label={`Edit ${item.name}`}
                            onClick={() => {
                              setConfirmDelete(null)
                              setEditing(item.id)
                            }}
                            className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-linen hover:text-espresso"
                          >
                            <Pencil className="size-4" />
                          </button>
                          <button
                            type="button"
                            aria-label={`Remove ${item.name}`}
                            onClick={() => setConfirmDelete(item.id)}
                            className="flex size-8 items-center justify-center rounded-full text-muted hover:bg-alert-wash hover:text-alert"
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </li>
                ),
              )}
            </ul>
          </section>
        ))
      )}
    </div>
  )
}

function MenuItemForm({
  shopId,
  item,
  categories,
  onDone,
  className,
}: {
  shopId: number
  item?: MenuItem
  categories: string[]
  onDone: () => void
  className?: string
}) {
  const save = useSaveMenuItem(shopId)
  const listId = useId()
  const form = useForm({
    initial: {
      category: item?.category ?? '',
      name: item?.name ?? '',
      price: item ? item.price.toFixed(2) : '',
      description: item?.description ?? '',
    },
    schema: itemSchema,
    onSubmit: async (v) => {
      await save.mutateAsync({
        itemId: item?.id,
        item: {
          category: v.category.trim(),
          name: v.name.trim(),
          price: Number(v.price.replace(',', '.')),
          description: v.description.trim() || undefined,
        },
      })
      onDone()
    },
  })

  return (
    <form onSubmit={form.handleSubmit} noValidate className={`card p-5 ${className ?? ''}`}>
      <div className="grid gap-5 sm:grid-cols-[1fr_1fr_140px]">
        <Field label="Category" placeholder="e.g. Coffee" list={listId} autoComplete="off" {...form.field('category')} />
        <datalist id={listId}>
          {categories.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <Field label="Name" placeholder="e.g. Flat white" {...form.field('name')} />
        <Field label="Price (lei)" inputMode="decimal" placeholder="14.50" {...form.field('price')} />
      </div>
      <Field
        label="Description (optional)"
        placeholder="Double ristretto, steamed milk"
        className="mt-5"
        {...form.field('description')}
      />
      {form.formError && (
        <div className="mt-5">
          <Notice>{form.formError}</Notice>
        </div>
      )}
      <div className="mt-6 flex flex-wrap gap-3">
        <Button type="submit" loading={form.submitting}>
          {item ? 'Save item' : 'Add to menu'}
        </Button>
        <Button type="button" variant="ghost" onClick={onDone}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
