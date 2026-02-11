import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Modal, ConfirmDialog } from './Modal'

describe('Modal', () => {
  it('isOpen이 false일 때 렌더링하지 않는다', () => {
    render(
      <Modal isOpen={false} onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>
    )
    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument()
  })

  it('isOpen이 true일 때 모달을 렌더링한다', () => {
    render(
      <Modal isOpen={true} onClose={() => {}}>
        <p>Modal Content</p>
      </Modal>
    )
    expect(screen.getByText('Modal Content')).toBeInTheDocument()
    expect(screen.getByRole('dialog')).toBeInTheDocument()
  })

  it('제목을 표시한다', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} title="테스트 모달">
        <p>Content</p>
      </Modal>
    )
    expect(screen.getByText('테스트 모달')).toBeInTheDocument()
  })

  it('닫기 버튼을 렌더링하고 클릭할 수 있다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <Modal isOpen={true} onClose={onClose} title="모달">
        <p>Content</p>
      </Modal>
    )
    
    const closeButton = screen.getByRole('button', { name: '모달 닫기' })
    expect(closeButton).toBeInTheDocument()
    
    await user.click(closeButton)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('showCloseButton이 false일 때 닫기 버튼을 숨긴다', () => {
    render(
      <Modal isOpen={true} onClose={() => {}} showCloseButton={false}>
        <p>Content</p>
      </Modal>
    )
    expect(screen.queryByRole('button', { name: '모달 닫기' })).not.toBeInTheDocument()
  })

  it('오버레이 클릭 시 모달을 닫는다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnOverlayClick={true}>
        <p>Content</p>
      </Modal>
    )
    
    const overlay = screen.getByRole('dialog')
    await user.click(overlay)
    expect(onClose).toHaveBeenCalled()
  })

  it('closeOnOverlayClick이 false일 때 오버레이 클릭 시 닫히지 않는다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnOverlayClick={false}>
        <p>Content</p>
      </Modal>
    )
    
    const overlay = screen.getByRole('dialog')
    await user.click(overlay)
    expect(onClose).not.toHaveBeenCalled()
  })

  it('ESC 키로 모달을 닫는다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnEscape={true}>
        <p>Content</p>
      </Modal>
    )
    
    await user.keyboard('{Escape}')
    expect(onClose).toHaveBeenCalled()
  })

  it('closeOnEscape이 false일 때 ESC 키로 닫히지 않는다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <Modal isOpen={true} onClose={onClose} closeOnEscape={false}>
        <p>Content</p>
      </Modal>
    )
    
    await user.keyboard('{Escape}')
    expect(onClose).not.toHaveBeenCalled()
  })

  it('크기 옵션을 적용한다', () => {
    const { rerender } = render(
      <Modal isOpen={true} onClose={() => {}} size="sm">
        <p>Content</p>
      </Modal>
    )
    expect(document.querySelector('.max-w-sm')).toBeInTheDocument()
    
    rerender(
      <Modal isOpen={true} onClose={() => {}} size="lg">
        <p>Content</p>
      </Modal>
    )
    expect(document.querySelector('.max-w-lg')).toBeInTheDocument()
  })
})

describe('ConfirmDialog', () => {
  it('확인 다이얼로그를 렌더링한다', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="삭제 확인"
        message="정말 삭제하시겠습니까?"
      />
    )
    
    expect(screen.getByText('삭제 확인')).toBeInTheDocument()
    expect(screen.getByText('정말 삭제하시겠습니까?')).toBeInTheDocument()
  })

  it('확인 버튼을 클릭하면 onConfirm과 onClose를 호출한다', async () => {
    const user = userEvent.setup()
    const onConfirm = vi.fn()
    const onClose = vi.fn()
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={onConfirm}
        title="확인"
        message="진행하시겠습니까?"
      />
    )
    
    const confirmButton = screen.getByRole('button', { name: '확인' })
    await user.click(confirmButton)
    
    expect(onConfirm).toHaveBeenCalledTimes(1)
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('취소 버튼을 클릭하면 onClose를 호출한다', async () => {
    const user = userEvent.setup()
    const onClose = vi.fn()
    
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={onClose}
        onConfirm={() => {}}
        title="확인"
        message="진행하시겠습니까?"
      />
    )
    
    const cancelButton = screen.getByRole('button', { name: '취소' })
    await user.click(cancelButton)
    
    expect(onClose).toHaveBeenCalledTimes(1)
  })

  it('커스텀 버튼 텍스트를 표시한다', () => {
    render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="확인"
        message="진행하시겠습니까?"
        confirmText="계속"
        cancelText="돌아가기"
      />
    )
    
    expect(screen.getByRole('button', { name: '계속' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: '돌아가기' })).toBeInTheDocument()
  })

  it('variant에 따라 다른 스타일을 적용한다', () => {
    const { rerender } = render(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="확인"
        message="메시지"
        variant="danger"
      />
    )
    let confirmButton = screen.getByRole('button', { name: '확인' })
    expect(confirmButton).toHaveClass('bg-red-600')
    
    rerender(
      <ConfirmDialog
        isOpen={true}
        onClose={() => {}}
        onConfirm={() => {}}
        title="확인"
        message="메시지"
        variant="warning"
      />
    )
    confirmButton = screen.getByRole('button', { name: '확인' })
    expect(confirmButton).toHaveClass('bg-yellow-600')
  })
})
