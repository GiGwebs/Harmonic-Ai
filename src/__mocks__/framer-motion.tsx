const mockMotion = {
  div: 'div',
  span: 'span',
  button: 'button',
  nav: 'nav',
  ul: 'ul',
  li: 'li',
  p: 'p',
  section: 'section',
  article: 'article',
  aside: 'aside',
  header: 'header',
  footer: 'footer',
  main: 'main',
};

export const motion = new Proxy(mockMotion, {
  get: (target, prop) => {
    if (prop in target) {
      return target[prop as keyof typeof mockMotion];
    }
    return 'div';
  },
});

export const AnimatePresence = ({ children }: { children: React.ReactNode }) => <>{children}</>;

export const useAnimation = () => ({
  start: jest.fn(),
  stop: jest.fn(),
  set: jest.fn(),
});

export const useMotionValue = (initial: number) => ({
  get: () => initial,
  set: jest.fn(),
  onChange: jest.fn(),
});

export const useTransform = () => ({
  get: jest.fn(),
  set: jest.fn(),
});

export const useViewportScroll = () => ({
  scrollY: {
    get: () => 0,
    onChange: jest.fn(),
  },
});
