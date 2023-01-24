import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'

import Search from '../src/components/Search'
import { SELECTABLE_TAGS_IN_APP } from '../src/components/Search'

const initialRestaurants = []

const favoritesForTesting = []

const setRestaurantsMocked = vi.fn(() => console.log('setRestaurants called'))

describe('Search component', () => {
    beforeEach(() => {
        render(<Search allRestaurants={initialRestaurants} favorites={favoritesForTesting} setRestaurants={setRestaurantsMocked} />)
    })
    afterEach(() => {
        vi.restoreAllMocks()
    })
    it('it renders the right amount of selectable tags', () => {
        const tagButtonElements = screen.getAllByRole('button')
        expect(tagButtonElements.length).toBe(SELECTABLE_TAGS_IN_APP.length)
    })
    it('typing in the input field results in setRestaurants method being called', async () => {
        const user = userEvent.setup()
        const inputElement = screen.getByRole('textbox')
        const inputText = 'tribu'

        await user.type(inputElement, inputText)

        // setRestaurants should be called on every character of input + one time in the beginning, when the component is mounted
        expect(setRestaurantsMocked).toHaveBeenCalledTimes(inputText.length + 1)
    })
    it('clicking a tag results in setRestaurants method being called and its css class changes', async () => {
        const user = userEvent.setup()
        const tagButtonElement = screen.getByText(SELECTABLE_TAGS_IN_APP[0])
        expect(tagButtonElement).not.toHaveClass('search-tag-button-toggled')

        await user.click(tagButtonElement)
        expect(tagButtonElement).toHaveClass('search-tag-button-toggled')

        await user.click(tagButtonElement)
        expect(tagButtonElement).not.toHaveClass('search-tag-button-toggled')

        expect(setRestaurantsMocked).toHaveBeenCalledTimes(2 + 1)
    })
})