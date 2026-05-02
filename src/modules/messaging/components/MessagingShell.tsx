import type { Role } from '../../../types/role'
import { useMessaging } from '../hooks/useMessaging'
import ChatThreadPanel from './ChatThreadPanel'
import ConversationListPanel from './ConversationListPanel'
import OfferModal from './OfferModal'

type Props = {
  role: Role
  businessLabel: string
}

export default function MessagingShell({ role, businessLabel }: Props) {
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
    errorBanner,
    dismissError,
    unreadTotal,
  } = useMessaging(role, businessLabel)

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
          labels={{
            emptyTitle: config.labels.emptyThreadTitle,
            emptyHint: config.labels.emptyThreadHint,
          }}
        />
      </div>

      <OfferModal
        open={offerModalOpen}
        role={role}
        config={config}
        onClose={() => setOfferModalOpen(false)}
        onSubmit={createOffer}
      />
    </>
  )
}
