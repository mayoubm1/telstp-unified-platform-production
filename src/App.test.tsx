import { render, screen } from '@testing-library/react';
import App from './App';

test('renders the TELsTP live-data loading state before values are available', () => {
  render(<App />);
  expect(screen.getByText(/Connecting to TELsTP live data/i)).toBeInTheDocument();
});
