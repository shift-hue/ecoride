'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import AppShell from '@/components/AppShell'
import ProtectedRoute from '@/components/ProtectedRoute'
import { ChatMessageDto, ConversationDto, messageApi } from '@/lib/api'
import { useAuth } from '@/context/AuthContext'
import { format, isToday, isYesterday } from 'date-fns'
import { Phone, MoreVertical, Plus, Send, Smile } from 'lucide-react'
import clsx from 'clsx'

export default function InboxPage() {
  return (
    <ProtectedRoute>
      <AppShell>
        <InboxContent />
      </AppShell>
    </ProtectedRoute>
  )
}

function InboxContent() {
  const { user } = useAuth()
  const searchParams = useSearchParams()
  const [conversations, setConversations] = useState<ConversationDto[]>([])
  const [activePeerId, setActivePeerId] = useState<string | null>(
    searchParams.get('peer')
  )
  const [messages, setMessages] = useState<ChatMessageDto[]>([])
  const [draft, setDraft] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const bottomRef = useRef<HTMLDivElement | null>(null)

  useEffect(() => {
    let cancelled = false

    async function loadConversations() {
      try {
        const list = await messageApi.conversations()
        if (cancelled) return
        setConversations(list)
        if (!activePeerId && list.length > 0) {
          setActivePeerId(list[0].peerId)
        }
      } catch (e: unknown) {
        if (cancelled) return
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to load conversations'
        setError(msg)
      } finally {
        if (!cancelled) setLoading(false)
      }
    }

    void loadConversations()
    const id = setInterval(loadConversations, 2500)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [activePeerId])

  useEffect(() => {
    if (!activePeerId) return
    const peerId = activePeerId
    let cancelled = false

    async function loadMessages() {
      try {
        const list = await messageApi.conversation(peerId)
        if (!cancelled) {
          setMessages(list)
          setError(null)
        }
      } catch (e: unknown) {
        if (cancelled) return
        const msg = (e as { response?: { data?: { message?: string } } })?.response?.data?.message ?? 'Unable to load messages'
        setError(msg)
      }
    }

    void loadMessages()
    const id = setInterval(loadMessages, 2000)

    return () => {
      cancelled = true
      clearInterval(id)
    }
  }, [activePeerId])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const activeConversation = useMemo(
    () => conversations.find((c) => c.peerId === activePeerId) ?? null,
    [conversations, activePeerId]
  )

  async function handleSend() {
    if (!activePeerId || !draft.trim()) return
    const content = draft.trim()
    setDraft('')
    try {
      await messageApi.send(activePeerId, content)
      const latest = await messageApi.conversation(activePeerId)
      setMessages(latest)
    } catch {
      setDraft(content)
    }
  }

  return (
    <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm" style={{ height: 'calc(100vh - 7.5rem)' }}>
      <div className="grid h-full grid-cols-1 xl:grid-cols-[320px_1fr]">
        <aside className="border-r border-slate-200 bg-white">
          <div className="border-b border-slate-200 px-4 py-4">
            <h1 className="text-[34px] font-semibold leading-none text-slate-900">Messages</h1>
          </div>

          {loading ? (
            <div className="p-4 text-sm text-slate-500">Loading conversations...</div>
          ) : (
            <div className="h-[calc(100%-4.5rem)] overflow-y-auto">
              {conversations.map((item) => (
                <button
                  key={item.peerId}
                  type="button"
                  onClick={() => setActivePeerId(item.peerId)}
                  className={clsx(
                    'flex w-full items-start gap-3 border-b border-slate-100 px-4 py-3 text-left',
                    activePeerId === item.peerId ? 'bg-brand-50' : 'hover:bg-slate-50'
                  )}
                >
                  <div className="relative">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                      {item.peerName.slice(0, 1).toUpperCase()}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-2">
                      <p className="truncate text-[16px] font-semibold text-slate-900">{item.peerName}</p>
                      <span className="whitespace-nowrap text-[11px] text-slate-400">{formatTime(item.lastMessageAt)}</span>
                    </div>
                    <p className="mt-0.5 truncate text-[14px] text-slate-500">{item.lastMessage}</p>
                  </div>
                </button>
              ))}

              {!loading && conversations.length === 0 && (
                <div className="p-4 text-sm text-slate-500">No contacts yet. Join or offer rides to start messaging.</div>
              )}
            </div>
          )}
        </aside>

        <main className="flex h-full flex-col bg-[#f8faf9]">
          <header className="flex items-center justify-between border-b border-slate-200 bg-white px-5 py-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-slate-200 text-sm font-semibold text-slate-700">
                  {activeConversation?.peerName?.slice(0, 1).toUpperCase() ?? 'C'}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 h-2.5 w-2.5 rounded-full bg-brand-500" />
              </div>
              <div>
                <p className="text-[16px] font-semibold text-slate-900">{activeConversation?.peerName ?? 'Select a conversation'}</p>
                <p className="text-xs text-brand-600">
                  {activeConversation ? `Trusted Rider • ${activeConversation.peerDepartment ?? 'Campus User'}` : 'Waiting for chat'}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-3 text-slate-500">
              <Phone className="h-4 w-4" />
              <MoreVertical className="h-4 w-4" />
            </div>
          </header>

          <div className="flex-1 overflow-y-auto px-5 py-4">
            {error && <p className="mb-2 text-sm text-red-600">{error}</p>}
            <div className="mb-4 flex justify-center">
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs text-slate-500">Today</span>
            </div>

            <div className="space-y-4">
              {messages.map((message) => {
                const mine = message.senderId === user?.id
                return (
                  <div key={message.id} className={clsx('flex gap-2', mine ? 'justify-end' : 'justify-start')}>
                    {!mine && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                        {activeConversation?.peerName.slice(0, 1).toUpperCase() ?? 'C'}
                      </div>
                    )}

                    <div className={clsx('max-w-[76%] rounded-2xl px-4 py-3 text-[14px]', mine ? 'bg-brand-500 text-white' : 'bg-white text-slate-700')}>
                      {message.content}
                      <div className={clsx('mt-1 text-[10px]', mine ? 'text-white/70' : 'text-slate-400')}>
                        {format(new Date(message.createdAt), 'hh:mm a')}
                      </div>
                    </div>

                    {mine && (
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-200 text-xs font-semibold text-slate-700">
                        {user?.name?.slice(0, 1).toUpperCase() ?? 'U'}
                      </div>
                    )}
                  </div>
                )
              })}
              <div ref={bottomRef} />
            </div>
          </div>

          <footer className="border-t border-slate-200 bg-white px-5 py-3">
            <div className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2">
              <button type="button" className="text-slate-400">
                <Plus className="h-4 w-4" />
              </button>
              <input
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    void handleSend()
                  }
                }}
                placeholder="Type a message..."
                className="h-9 flex-1 bg-transparent text-sm text-slate-700 placeholder:text-slate-400 focus:outline-none"
              />
              <button type="button" className="text-slate-400">
                <Smile className="h-4 w-4" />
              </button>
              <button
                type="button"
                disabled={!activePeerId || !draft.trim()}
                onClick={() => void handleSend()}
                className="inline-flex h-9 w-9 items-center justify-center rounded-full bg-brand-500 text-white disabled:opacity-50"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </footer>
        </main>
      </div>
    </section>
  )
}

function formatTime(iso: string) {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  if (isToday(date)) return format(date, 'hh:mm a')
  if (isYesterday(date)) return 'Yesterday'
  return format(date, 'EEE')
}
