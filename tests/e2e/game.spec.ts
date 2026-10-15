import { test, expect, type Page } from '@playwright/test'

/** 地図上の市町村を data-code で特定してクリックする（SVG path の中心） */
async function tapMunicipality(page: Page, code: string) {
  const path = page.locator(`[data-testid="chiba-map"] path[data-code="${code}"]`)
  await expect(path).toBeVisible()
  // 重心でクリックする（bbox の中心が自領域外になる形もあるため、キーボードで確定させる）
  await path.focus()
  await page.keyboard.press('Enter')
}

async function startMode(page: Page, mode: 'easy' | 'normal' | 'challenge', seed = 1, extraQuery = '') {
  await page.goto(`./?seed=${seed}${extraQuery}`)
  await page.getByTestId('play-button').click()
  await page.getByTestId(`mode-${mode}`).click()
  await expect(page.getByTestId('quiz-screen')).toBeVisible()
}

test.describe('title and navigation', () => {
  test('shows the title screen and opens how-to and zukan', async ({ page }) => {
    await page.goto('./')
    await expect(page.getByRole('heading', { name: /ど〜こだ/ })).toBeVisible()
    await expect(page.getByTestId('play-button')).toBeEnabled()
    await page.getByTestId('howto-button').click()
    await expect(page.getByTestId('howto-screen')).toBeVisible()
    await page.getByRole('button', { name: 'タイトルへもどる' }).click()
    await page.getByTestId('zukan-button').click()
    await expect(page.getByTestId('zukan-screen')).toBeVisible()
    await expect(page.getByTestId('discovered-count')).toContainText('0')
  })

  test('loads static assets from the base path', async ({ page, baseURL }) => {
    const failed: string[] = []
    page.on('response', (res) => {
      if (res.status() >= 400) failed.push(`${res.status()} ${res.url()}`)
    })
    await page.goto('./')
    await expect(page.getByTestId('chiba-map')).toBeVisible()
    expect(failed).toEqual([])
    const geoResponse = await page.request.get(`${baseURL}data/chiba-municipalities.json`)
    expect(geoResponse.ok()).toBe(true)
  })
})

test.describe('easy mode', () => {
  test('answers correctly, shows feedback, and reaches the result after 10 questions', async ({ page }) => {
    await startMode(page, 'easy')
    for (let i = 0; i < 10; i++) {
      const question = page.getByTestId('question')
      await expect(question).toContainText(`Q${i + 1}`)
      const target = await question.getAttribute('data-target')
      expect(target).toMatch(/^12\d{3}$/)
      await tapMunicipality(page, target!)
      await page.getByTestId('confirm-button').click()
      const feedback = page.getByTestId('feedback')
      await expect(feedback).toBeVisible()
      await expect(feedback).toContainText('だいせいかい')
      await expect(feedback.getByTestId('trivia')).toBeVisible()
      await page.getByTestId('next-button').click()
    }
    await expect(page.getByTestId('result-screen')).toBeVisible()
    await expect(page.getByTestId('stat-correct')).toContainText('10')
    await expect(page.getByTestId('rank-title')).toContainText('チーバくんマスター')
  })

  test('shows a wrong answer, keeps lives, and reveals the correct place after 3 misses', async ({ page }) => {
    await startMode(page, 'easy', 5)
    const target = await page.getByTestId('question').getAttribute('data-target')
    const wrongCandidates = ['12100', '12205', '12202'].filter((c) => c !== target).slice(0, 3)
    if (wrongCandidates.length < 3) wrongCandidates.push('12236')
    await tapMunicipality(page, wrongCandidates[0]!)
    await page.getByTestId('confirm-button').click()
    await expect(page.getByTestId('toast')).toContainText('おしい')
    await expect(page.getByTestId('lives')).toHaveAttribute('aria-label', 'のこり 2 かい')
    await tapMunicipality(page, wrongCandidates[1]!)
    await page.getByTestId('confirm-button').click()
    await tapMunicipality(page, wrongCandidates[2]!)
    await page.getByTestId('confirm-button').click()
    const feedback = page.getByTestId('feedback')
    await expect(feedback).toBeVisible()
    await expect(feedback).toHaveAttribute('data-correct', 'false')
    await expect(page.locator(`path[data-code="${target}"]`)).toHaveAttribute('data-style', 'correct')
  })

  test('hint highlights the region and the score has no bonus', async ({ page }) => {
    await startMode(page, 'easy', 9)
    await page.getByTestId('hint-button').click()
    await expect(page.getByTestId('hint-text')).toBeVisible()
    await expect(page.locator('path[data-style="hint"]').first()).toBeVisible()
  })
})

test.describe('normal mode', () => {
  test('answers 4-choice questions and shows an explanation on a miss', async ({ page }) => {
    await startMode(page, 'normal', 3)
    await expect(page.locator('path[data-style="target"]')).toHaveCount(1)
    const target = await page.getByTestId('question').getAttribute('data-target')
    await page.locator(`[data-testid="choices"] button[data-code="${target}"]`).click()
    await expect(page.getByTestId('feedback')).toContainText('だいせいかい')
    await page.getByTestId('next-button').click()

    const second = await page.getByTestId('question').getAttribute('data-target')
    const wrong = page.locator(`[data-testid="choices"] button:not([data-code="${second}"])`).first()
    await wrong.click()
    const feedback = page.getByTestId('feedback')
    await expect(feedback).toContainText('おしい')
    await expect(feedback).toContainText('せいかいは')
    await expect(page.locator('path[data-style="wrong"]')).toHaveCount(1)
    await expect(page.locator('path[data-style="correct"]')).toHaveCount(1)
  })
})

test.describe('challenge mode', () => {
  test('shows a timer and finishes with a result when time runs out', async ({ page }) => {
    // ?timeLimit= で制限時間を 6 秒に短縮する（テスト専用オプション）
    await startMode(page, 'challenge', 2, '&timeLimit=6')
    await expect(page.getByTestId('timer')).toContainText('6')
    const question = page.getByTestId('question')
    const type = await question.getAttribute('data-type')
    const target = await question.getAttribute('data-target')
    if (type === 'choice') {
      await page.locator(`[data-testid="choices"] button[data-code="${target}"]`).click()
    } else {
      await tapMunicipality(page, target!)
    }
    await expect(page.getByTestId('feedback')).toBeVisible()
    await expect(page.getByTestId('result-screen')).toBeVisible({ timeout: 12_000 })
    await expect(page.getByTestId('stat-correct')).toContainText('1')
  })
})

test.describe('persistence', () => {
  test('updates the zukan and keeps data after reload', async ({ page }) => {
    await startMode(page, 'easy', 11)
    const target = await page.getByTestId('question').getAttribute('data-target')
    await tapMunicipality(page, target!)
    await page.getByTestId('confirm-button').click()
    await page.getByTestId('next-button').click()
    // 残り 9 問は飛ばして結果へ（やめる → 保存されないので、正解した 1 問を反映するため全問解く）
    for (let i = 1; i < 10; i++) {
      const t = await page.getByTestId('question').getAttribute('data-target')
      await tapMunicipality(page, t!)
      await page.getByTestId('confirm-button').click()
      await page.getByTestId('next-button').click()
    }
    await expect(page.getByTestId('result-screen')).toBeVisible()
    await page.getByTestId('result-zukan-button').click()
    await expect(page.getByTestId('discovered-count')).toContainText('10')
    await expect(page.locator(`[data-testid="zukan-card"][data-code="${target}"]`)).toHaveAttribute('data-discovered', 'true')

    await page.reload()
    await expect(page.getByTestId('title-screen')).toBeVisible()
    await page.getByTestId('zukan-button').click()
    await expect(page.getByTestId('discovered-count')).toContainText('10')
  })

  test('remembers the sound setting', async ({ page }) => {
    await page.goto('./')
    const toggle = page.getByTestId('sound-toggle')
    await expect(toggle).toHaveAttribute('aria-pressed', 'true')
    await toggle.click()
    await expect(toggle).toHaveAttribute('aria-pressed', 'false')
    await page.reload()
    await expect(page.getByTestId('sound-toggle')).toHaveAttribute('aria-pressed', 'false')
  })
})

test.describe('mobile layout', () => {
  test('fits in a narrow portrait viewport without horizontal scroll', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 568 })
    await startMode(page, 'easy', 4)
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    expect(scrollWidth).toBeLessThanOrEqual(320)
    await expect(page.getByTestId('chiba-map')).toBeVisible()
    await page.getByRole('button', { name: '拡大' }).click()
    await expect(page.getByTestId('chiba-map')).not.toHaveAttribute('data-scale', '1.00')
  })
})
