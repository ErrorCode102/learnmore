import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { renderApp } from '../App';

describe('AuthLab home shell', () => {
  it('shows the AuthLab brand and a start-learning action', () => {
    render(renderApp());

    expect(screen.getByText('AuthLab')).toBeVisible();
    expect(screen.getByRole('button', { name: 'เริ่มเรียน' })).toBeVisible();
  });
});
