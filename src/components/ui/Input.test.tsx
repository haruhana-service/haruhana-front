import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { Input } from './Input'

describe('Input', () => {
  it('기본 인풋을 렌더링한다', () => {
    render(<Input placeholder="이름을 입력하세요" />)
    expect(screen.getByPlaceholderText('이름을 입력하세요')).toBeInTheDocument()
  })

  it('라벨을 표시한다', () => {
    render(<Input label="이름" />)
    expect(screen.getByText('이름')).toBeInTheDocument()
  })

  it('필수 표시를 보여준다', () => {
    render(<Input label="이메일" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('에러 메시지를 표시한다', () => {
    render(<Input label="이름" error="이름은 필수입니다" id="name-input" />)
    expect(screen.getByText('이름은 필수입니다')).toBeInTheDocument()
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-invalid', 'true')
    expect(input).toHaveAttribute('aria-describedby', 'name-input-error')
  })

  it('도움말 텍스트를 표시한다', () => {
    render(<Input label="비밀번호" helperText="8자 이상 입력하세요" id="pwd-input" />)
    expect(screen.getByText('8자 이상 입력하세요')).toBeInTheDocument()
    
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('aria-describedby', 'pwd-input-helper')
  })

  it('비활성화 상태를 렌더링한다', () => {
    render(<Input disabled />)
    const input = screen.getByRole('textbox')
    expect(input).toBeDisabled()
  })

  it('사용자 입력을 처리한다', async () => {
    const user = userEvent.setup()
    render(<Input placeholder="텍스트 입력" />)
    
    const input = screen.getByPlaceholderText('텍스트 입력')
    await user.type(input, 'Hello')
    
    expect(input).toHaveValue('Hello')
  })

  it('variant를 적용한다', () => {
    const { rerender } = render(<Input variant="default" />)
    let input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-white')
    
    rerender(<Input variant="filled" />)
    input = screen.getByRole('textbox')
    expect(input).toHaveClass('bg-slate-50')
  })

  it('왼쪽 아이콘을 렌더링한다', () => {
    render(
      <Input 
        leftIcon={<span data-testid="left-icon">🔍</span>}
      />
    )
    expect(screen.getByTestId('left-icon')).toBeInTheDocument()
  })

  it('오른쪽 아이콘을 렌더링한다', () => {
    render(
      <Input 
        rightIcon={<span data-testid="right-icon">✓</span>}
      />
    )
    expect(screen.getByTestId('right-icon')).toBeInTheDocument()
  })

  it('커스텀 className을 적용한다', () => {
    render(<Input className="custom-input" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveClass('custom-input')
  })

  it('type 속성을 설정할 수 있다', () => {
    render(<Input type="email" />)
    const input = screen.getByRole('textbox')
    expect(input).toHaveAttribute('type', 'email')
  })
})
