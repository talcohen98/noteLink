import { test, expect } from '@playwright/test';
test.describe('Authentication', () => {
    //1 - register new user (not working when already registers previously)
    test('should allow user to register', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="create_user_form_name"]', 'Test-User1');
    await page.fill('input[name="create_user_form_email"]', 'tu1@walla.co.il');
    await page.fill('input[name="create_user_form_username"]', 'tu1-userName');
    await page.fill('input[name="create_user_form_password"]', 'password');
    await page.click('button[name="create_user_form_create_user"]');
    await expect(page.locator('text=Registration successful. You can now log in.')).toBeVisible();
  });
  //2 - check login ok (verification: logut button)
  test('should allow user to login', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="login_form_username"]', 'tu1-userName');
    await page.fill('input[name="login_form_password"]', 'password');
    await page.click('button[type="submit"]');
    await expect(page.locator('button[name="logout"]')).toBeVisible();
  });
//3 - no user logged in does not allow add new note
  test('should not allow non-logged-in user to add a note', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('button[name="add_new_note"]')).toBeHidden();
  });
//4     authorized user should be able to add new note
  test('should allow logged-in user to add a note', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="login_form_username"]', 'tu1-userName');
    await page.fill('input[name="login_form_password"]', 'password');
    await page.click('button[type="submit"]');
    await page.click('button[name="add_new_note"]');
    await page.fill('input[placeholder="Title"]', 'New Note');
    await page.fill('textarea[name="text_input_new_note"]', 'This is a new note.');
    await page.click('button[name="text_input_save_new_note"]');
    await expect(page.locator('.note').filter({ hasText: 'New Note' })).toBeVisible();
  });

  // 5 - user will be able to delete only a note they create
  test('should not allow user to delete note they did not create', async ({ page }) => {
    await page.goto('/');
    await page.fill('input[name="login_form_username"]', 'tu2-userName');
    await page.fill('input[name="login_form_password"]', 'password2');
    await page.click('button[type="submit"]');
    await expect(page.locator('button[name="delete-1"]')).toBeHidden();
  });

});
