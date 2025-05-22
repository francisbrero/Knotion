const range = selection.getRangeAt(0);
document.dispatchEvent(new CustomEvent('knotion-selection', {
    detail: {
        text: selection.toString(),
        rect: range.getBoundingClientRect && range.getBoundingClientRect() || range.getClientRects()[0],
    }
})); 