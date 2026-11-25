import { fireEvent, render, screen, waitFor, within } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderApp } from '../App';

function renderAt(path: string) {
  window.location.hash = `#${path}`;
  return render(renderApp());
}

function primaryNavigation() {
  return screen.getByRole('navigation', { name: 'นำทางหลัก' });
}

beforeEach(() => {
  localStorage.clear();
  window.location.hash = '#/';
});

afterEach(() => {
  window.location.hash = '#/';
  localStorage.clear();
  vi.restoreAllMocks();
});

describe('AppShell navigation', () => {
  it('prevents the skip-link fragment and focuses the main content', () => {
    const scrollIntoView = vi.fn();
    Object.defineProperty(Element.prototype, 'scrollIntoView', {
      configurable: true,
      value: scrollIntoView,
    });
    renderAt('/');
    const skipLink = screen.getByRole('link', { name: 'ข้ามไปยังเนื้อหา' });
    const main = document.getElementById('main-content');
    if (!main) {
      throw new Error('Main content was not rendered.');
    }

    skipLink.focus();
    const click = new MouseEvent('click', { bubbles: true, cancelable: true });
    fireEvent(skipLink, click);

    expect(click.defaultPrevented).toBe(true);
    expect(main).toHaveFocus();
    expect(scrollIntoView).toHaveBeenCalledWith({ block: 'start' });
    expect(scrollIntoView.mock.instances.at(-1)).toBe(main);
    expect(window.location.hash).toBe('#/');
  });

  it('keeps home current on lesson routes and activates practice and demo', () => {
    renderAt('/lesson/overview');

    expect(within(primaryNavigation()).getByRole('link', { name: 'หน้าหลัก' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(primaryNavigation()).getByRole('link', { name: 'ฝึกท้ายบท' })).not.toHaveAttribute(
      'aria-current',
    );

    fireEvent.click(within(primaryNavigation()).getByRole('link', { name: 'ฝึกท้ายบท' }));
    expect(within(primaryNavigation()).getByRole('link', { name: 'ฝึกท้ายบท' })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(within(primaryNavigation()).getByRole('link', { name: 'หน้าหลัก' })).not.toHaveAttribute(
      'aria-current',
    );

    fireEvent.click(within(primaryNavigation()).getByRole('link', { name: 'Authentication Demo' }));
    expect(
      within(primaryNavigation()).getByRole('link', { name: 'Authentication Demo' }),
    ).toHaveAttribute('aria-current', 'page');
    expect(within(primaryNavigation()).getByRole('link', { name: 'ฝึกท้ายบท' })).not.toHaveAttribute(
      'aria-current',
    );
  });

  it('clips horizontal decoration without making the sticky shell a scroll container', () => {
    const { container } = renderAt('/');
    const wrapper = container.firstElementChild;
    const navigation = container.querySelector('aside');

    expect(wrapper).toHaveClass('overflow-x-clip');
    expect(wrapper).not.toHaveClass('overflow-x-hidden');
    expect(navigation).toHaveClass('sticky', 'top-0');
  });

  it('returns to the dashboard and resets focus and scroll after fragment navigation', async () => {
    const scrollTo = vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
    renderAt('/#course-map');

    try {
      await waitFor(() => {
        expect(document.getElementById('course-map')).toHaveFocus();
      });
      fireEvent.click(screen.getByRole('link', { name: 'AuthLab หน้าแรก' }));

      await waitFor(() => {
        expect(document.getElementById('main-content')).toHaveFocus();
        expect(scrollTo).toHaveBeenCalledWith({ top: 0, behavior: 'instant' });
      });
      expect(window.location.hash).toBe('#/');
    } finally {
      scrollTo.mockRestore();
    }
  });
});
