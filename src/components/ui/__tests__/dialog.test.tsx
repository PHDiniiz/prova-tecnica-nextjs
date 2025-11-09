import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '../dialog';

describe('Dialog Component', () => {
  const mockOnOpenChange = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('deve renderizar o dialog quando open é true', () => {
    render(
      <Dialog open={true} onOpenChange={mockOnOpenChange}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Teste Dialog</DialogTitle>
            <DialogDescription>Descrição do teste</DialogDescription>
          </DialogHeader>
          <DialogFooter>Footer</DialogFooter>
        </DialogContent>
      </Dialog>
    );

    expect(screen.getByText('Teste Dialog')).toBeInTheDocument();
    expect(screen.getByText('Descrição do teste')).toBeInTheDocument();
    expect(screen.getByText('Footer')).toBeInTheDocument();
  });

  it('não deve renderizar o dialog quando open é false', () => {
    render(
      <Dialog open={false} onOpenChange={mockOnOpenChange}>
        <DialogContent>
          <DialogTitle>Teste Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    expect(screen.queryByText('Teste Dialog')).not.toBeInTheDocument();
  });

  it('deve fechar o dialog ao clicar no overlay', async () => {
    const user = userEvent.setup();
    render(
      <Dialog open={true} onOpenChange={mockOnOpenChange}>
        <DialogContent>
          <DialogTitle>Teste Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const overlay = screen.getByText('Teste Dialog').closest('.fixed.inset-0');
    if (overlay) {
      await user.click(overlay);
      await waitFor(() => {
        expect(mockOnOpenChange).toHaveBeenCalledWith(false);
      });
    }
  });

  it('deve fechar o dialog ao pressionar ESC', async () => {
    const user = userEvent.setup();
    render(
      <Dialog open={true} onOpenChange={mockOnOpenChange}>
        <DialogContent>
          <DialogTitle>Teste Dialog</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    await user.keyboard('{Escape}');
    await waitFor(() => {
      expect(mockOnOpenChange).toHaveBeenCalledWith(false);
    });
  });

  it('deve aplicar tamanhos corretos', () => {
    const { rerender } = render(
      <Dialog open={true} onOpenChange={mockOnOpenChange}>
        <DialogContent size="sm">
          <DialogTitle>Small</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const content = screen.getByText('Small').closest('.max-w-sm');
    expect(content).toBeInTheDocument();

    rerender(
      <Dialog open={true} onOpenChange={mockOnOpenChange}>
        <DialogContent size="lg">
          <DialogTitle>Large</DialogTitle>
        </DialogContent>
      </Dialog>
    );

    const largeContent = screen.getByText('Large').closest('.max-w-lg');
    expect(largeContent).toBeInTheDocument();
  });
});

