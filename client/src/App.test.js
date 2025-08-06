import { render, screen } from '@testing-library/react';
import App from './App';

test('renders CoffeeSpots app', () => {
  render(<App />);
  const titleElement = screen.getByText(/Erlebe Kaffee neu/i);
  expect(titleElement).toBeInTheDocument();
});
