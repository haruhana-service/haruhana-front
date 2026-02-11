import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { TextArea } from './TextArea'

describe('TextArea', () => {
  it('기본 텍스트 영역을 렌더링한다', () => {
    render(<TextArea placeholder="내용을 입력하세요" />)
    expect(screen.getByPlaceholderText('내용을 입력하세요')).toBeInTheDocument()
  })

  it('라벨을 표시한다', () => {
    render(<TextArea label="설명" />)
    expect(screen.getByText('설명')).toBeInTheDocument()
  })

  it('필수 표시를 보여준다', () => {
    render(<TextArea label="내용" required />)
    expect(screen.getByText('*')).toBeInTheDocument()
  })

  it('에러 메시지를 표시한다', () => {
    render(<TextArea label="내용" error="내용은 필수입니다" id="content-input" />)
    expect(screen.getByText('내용은 필수입니다')).toBeInTheDocument()
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-invalid', 'true')
    expect(textarea).toHaveAttribute('aria-describedby', 'content-input-error')
  })

  it('도움말 텍스트를 표시한다', () => {
    render(<TextArea label="설명" helperText="최소 10자 이상 입력하세요" id="desc-input" />)
    expect(screen.getByText('최소 10자 이상 입력하세요')).toBeInTheDocument()
    
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('aria-describedby', 'desc-input-helper')
  })

  it('비활성화 상태를 렌더링한다', () => {
    render(<TextArea disabled />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toBeDisabled()
  })

  it('사용자 입력을 처리한다', async () => {
    const user = userEvent.setup()
    render(<TextArea placeholder="텍스트 입력" />)
    
    const textarea = screen.getByPlaceholderText('텍스트 입력')
    await user.type(textarea, 'Hello World')
    
    expect(textarea).toHaveValue('Hello World')
  })

  it('문자 수를 표시한다', () => {
    render(<TextArea showCharCount value="" onChange={() => {}} />)

    expect(screen.getByText('0')).toBeInTheDocument()
  })

  it('문자 수 제한을 표시한다', () => {
    render(<TextArea showCharCount maxLength={100} value="" onChange={() => {}} />)
    expect(screen.getByText('0 / 100')).toBeInTheDocument()
  })

  it('최대 길이를 초과하면 경고 색상을 표시한다', () => {
    render(
      <TextArea 
        showCharCount 
        maxLength={10} 
        value="This is a very long text" 
        onChange={() => {}}
      />
    )
    const charCount = screen.getByText(/24/)
    expect(charCount).toHaveClass('text-red-600')
  })

  it('variant를 적용한다', () => {
    const { rerender } = render(<TextArea variant="default" />)
    let textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('bg-white')
    
    rerender(<TextArea variant="filled" />)
    textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('bg-slate-50')
  })

  it('커스텀 className을 적용한다', () => {
    render(<TextArea className="custom-textarea" />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveClass('custom-textarea')
  })

  it('rows 속성을 설정할 수 있다', () => {
    render(<TextArea rows={5} />)
    const textarea = screen.getByRole('textbox')
    expect(textarea).toHaveAttribute('rows', '5')
  })
})
