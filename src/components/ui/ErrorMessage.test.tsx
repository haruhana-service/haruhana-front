import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { ErrorMessage, PageError, FormError } from './ErrorMessage'

describe('ErrorMessage', () => {
  it('에러 메시지를 렌더링한다', () => {
    render(<ErrorMessage message="문제가 발생했습니다" />)
    expect(screen.getByText('문제가 발생했습니다')).toBeInTheDocument()
    expect(screen.getByRole('alert')).toBeInTheDocument()
  })

  it('제목을 표시한다', () => {
    render(<ErrorMessage title="오류 발생" message="문제가 발생했습니다" />)
    expect(screen.getByText('오류 발생')).toBeInTheDocument()
  })

  it('다시 시도 버튼을 렌더링하고 클릭할 수 있다', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    
    render(
      <ErrorMessage 
        message="네트워크 오류" 
        onRetry={onRetry}
      />
    )
    
    const retryButton = screen.getByRole('button', { name: '다시 시도' })
    expect(retryButton).toBeInTheDocument()
    
    await user.click(retryButton)
    expect(onRetry).toHaveBeenCalledTimes(1)
  })

  it('variant에 따라 다른 스타일을 적용한다', () => {
    const { rerender } = render(
      <ErrorMessage message="에러" variant="error" />
    )
    expect(screen.getByRole('alert')).toHaveClass('bg-red-50')
    
    rerender(<ErrorMessage message="경고" variant="warning" />)
    expect(screen.getByRole('alert')).toHaveClass('bg-yellow-50')
    
    rerender(<ErrorMessage message="정보" variant="info" />)
    expect(screen.getByRole('alert')).toHaveClass('bg-blue-50')
  })

  it('커스텀 className을 적용할 수 있다', () => {
    render(<ErrorMessage message="에러" className="custom-class" />)
    expect(screen.getByRole('alert')).toHaveClass('custom-class')
  })

  it('커스텀 아이콘을 표시할 수 있다', () => {
    render(
      <ErrorMessage 
        message="에러" 
        icon={<span data-testid="custom-icon">⚠️</span>}
      />
    )
    expect(screen.getByTestId('custom-icon')).toBeInTheDocument()
  })
})

describe('PageError', () => {
  it('페이지 에러를 렌더링한다', () => {
    render(<PageError message="페이지를 불러올 수 없습니다" />)
    expect(screen.getByText('오류가 발생했습니다')).toBeInTheDocument()
    expect(screen.getByText('페이지를 불러올 수 없습니다')).toBeInTheDocument()
  })

  it('커스텀 제목을 표시한다', () => {
    render(
      <PageError 
        title="404 에러" 
        message="페이지를 찾을 수 없습니다"
      />
    )
    expect(screen.getByText('404 에러')).toBeInTheDocument()
  })

  it('다시 시도 버튼을 렌더링한다', async () => {
    const user = userEvent.setup()
    const onRetry = vi.fn()
    
    render(<PageError message="에러" onRetry={onRetry} />)
    
    const retryButton = screen.getByRole('button', { name: '다시 시도' })
    await user.click(retryButton)
    expect(onRetry).toHaveBeenCalled()
  })
})

describe('FormError', () => {
  it('폼 에러 메시지를 렌더링한다', () => {
    render(<FormError message="이 필드는 필수입니다" />)
    expect(screen.getByText('이 필드는 필수입니다')).toBeInTheDocument()
  })

  it('에러 아이콘을 표시한다', () => {
    const { container } = render(<FormError message="에러" />)
    const icon = container.querySelector('svg')
    expect(icon).toBeInTheDocument()
  })
})
