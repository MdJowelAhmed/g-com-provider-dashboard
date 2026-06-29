import { Loader2 } from 'lucide-react'
import { useAuth } from '../../../context/AuthContext'
import type { Role } from '../../../types/role'
import { useMessaging } from '../hooks/useMessaging'
import ChatThreadPanel from './ChatThreadPanel'
import ConversationListPanel from './ConversationListPanel'
import OfferModal from './OfferModal'

type Props = {
  role: Role
}

export default function MessagingShell({ role }: Props) {
  const { user } = useAuth()
  const currentUserId = user?.id ?? ''

  const {
    config,
    conversations,
    selectedConversation,
    selectedId,
    selectConversation,
    search,
    setSearch,
    messages,
    offers,
    sendText,
    attachPlaceholder,
    loadMoreConversations,
    hasMoreConversations,
    loadingOlderConv,
    offerModalOpen,
    setOfferModalOpen,
    createOffer,
    withdrawOffer,
    withdrawingOfferId,
    errorBanner,
    dismissError,
    unreadTotal,
    initialLoading,
    listFetching,
    messagesLoading,
    isSending,
    isCreatingOffer,
  } = useMessaging(role, currentUserId)

  if (initialLoading) {
    return (
      <div className="flex h-full min-h-[480px] items-center justify-center rounded-xl border border-surface-border bg-surface-card">
        <div className="flex items-center gap-2 text-sm text-gray-500">
          <Loader2 size={18} className="animate-spin" />
          Loading conversations…
        </div>
      </div>
    )
  }

  return (
    <>
      <div className="flex h-full min-h-0 w-full flex-1 overflow-hidden rounded-xl border border-surface-border bg-surface-card">
        <ConversationListPanel
          title={config.labels.pageTitle}
          unreadTotal={unreadTotal}
          search={search}
          onSearchChange={setSearch}
          searchPlaceholder={config.labels.searchPlaceholder}
          conversations={conversations}
          selectedId={selectedId}
          onSelect={selectConversation}
          hasMore={hasMoreConversations}
          loadingMore={loadingOlderConv}
          onLoadMore={loadMoreConversations}
          refreshing={listFetching && !initialLoading}
        />
        <ChatThreadPanel
          conversation={selectedConversation}
          messages={messages}
          offers={offers}
          quickReplies={config.labels.quickReplies}
          remoteTyping={selectedConversation?.isTyping}
          errorBanner={errorBanner}
          onDismissError={dismissError}
          onSend={sendText}
          onAttach={attachPlaceholder}
          onOpenOffer={() => setOfferModalOpen(true)}
          onWithdrawOffer={withdrawOffer}
          withdrawingOfferId={withdrawingOfferId}
          loading={messagesLoading}
          sending={isSending}
          labels={{
            emptyTitle: config.labels.emptyThreadTitle,
            emptyHint: config.labels.emptyThreadHint,
          }}
        />
      </div>

      <OfferModal
        open={offerModalOpen}
        businessCategory={user?.extra?.category}
        config={config}
        submitting={isCreatingOffer}
        onClose={() => setOfferModalOpen(false)}
        onSubmit={createOffer}
      />
    </>
  )
}
