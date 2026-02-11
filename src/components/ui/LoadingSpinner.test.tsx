import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { LoadingSpinner, FullScreenLoading, PageLoading } from './LoadingSpinner'

describe('LoadingSpinner', () => {
  it('기본 스피너를 렌더링한다', () => {
    render(<LoadingSpinner />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(spinner).toHaveAttribute('aria-label', '로딩 중')
  })

  it('텍스트를 표시한다', () => {
    render(<LoadingSpinner text="데이터 불러오는 중..." />)
    expect(screen.getByText('데이터 불러오는 중...')).toBeInTheDocument()
  })

  it('크기를 변경할 수 있다', () => {
    const { container } = render(<LoadingSpinner size="lg" />)
    const spinner = container.querySelector('.w-12')
    expect(spinner).toBeInTheDocument()
  })

  it('variant를 변경할 수 있다', () => {
    const { container } = render(<LoadingSpinner variant="white" />)
    const spinner = container.querySelector('.border-white')
    expect(spinner).toBeInTheDocument()
  })

  it('커스텀 className을 적용할 수 있다', () => {
    const { container } = render(<LoadingSpinner className="custom-class" />)
    expect(container.firstChild).toHaveClass('custom-class')
  })
})

describe('FullScreenLoading', () => {
  it('전체 화면 로딩을 렌더링한다', () => {
    render(<FullScreenLoading />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
    expect(screen.getByText('로딩 중...')).toBeInTheDocument()
  })

  it('커스텀 텍스트를 표시한다', () => {
    render(<FullScreenLoading text="잠시만 기다려주세요..." />)
    expect(screen.getByText('잠시만 기다려주세요...')).toBeInTheDocument()
  })
})

describe('PageLoading', () => {
  it('페이지 로딩을 렌더링한다', () => {
    render(<PageLoading />)
    const spinner = screen.getByRole('status')
    expect(spinner).toBeInTheDocument()
  })

  it('텍스트와 함께 렌더링한다', () => {
    render(<PageLoading text="페이지 로딩 중..." />)
    expect(screen.getByText('페이지 로딩 중...')).toBeInTheDocument()
  })
})
