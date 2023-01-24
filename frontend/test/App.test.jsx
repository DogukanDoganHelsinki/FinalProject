import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import App from '../src/App'
import userEvent from '@testing-library/user-event'


describe('App dummy tests', () => {
    it('true is true', () => {
        expect(true).toBe(true)
    })
})

describe('Random check', () => {
    it('two buttons', () => {
        render(<App />)
        const items = document.querySelectorAll('.btn')
        expect(items).toHaveLength(2)
    })

    it('two input', () => {
        render(<App />)
        const items = document.querySelectorAll('input')
        expect(items).toHaveLength(2)
    })
})

describe('Pressing buttons', () => {

    it('try login', async () => {
        render(<App />)

        const user = userEvent.setup()
        const usernameInput = screen.getAllByRole('textbox')[0]
        const loginButton = document.querySelectorAll('.btn')[0]

        await user.type(usernameInput, "myUsername")
        await user.click(loginButton)

        // What next? '-'
    })
})