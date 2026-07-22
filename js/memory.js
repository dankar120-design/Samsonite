/* ==========================================================================
   SAMSONITE - MEMORY GAME ENGINE
   ========================================================================== */

class MemoryGame {
  constructor(gridElement, matchCounterElement, onCompleteCallback) {
    this.grid = gridElement;
    this.matchCounterEl = matchCounterElement;
    this.onComplete = onCompleteCallback;

    this.cardTypes = ['llama', 'supply_drop', 'boogie_bomb', 'victory_crown', 'squishy'];
    this.cards = [];
    this.flippedCards = [];
    this.matchedPairs = 0;
    this.isLockBoard = false;
  }

  init() {
    this.matchedPairs = 0;
    this.flippedCards = [];
    this.isLockBoard = false;
    this.updateMatchCounter();

    // Create 5 pairs = 10 cards
    const deck = [...this.cardTypes, ...this.cardTypes];
    this.shuffle(deck);

    this.renderBoard(deck);
  }

  shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
  }

  renderBoard(deck) {
    this.grid.innerHTML = '';
    this.cards = [];

    deck.forEach((type, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.dataset.type = type;
      cardEl.dataset.index = index;

      cardEl.innerHTML = `
        <div class="card-inner">
          <div class="card-back"></div>
          <div class="card-front">
            <div class="card-icon">
              ${SVG_ASSETS[type] || ''}
            </div>
          </div>
        </div>
      `;

      cardEl.addEventListener('click', () => this.handleCardClick(cardEl));
      this.grid.appendChild(cardEl);
      this.cards.push(cardEl);
    });
  }

  handleCardClick(cardEl) {
    if (this.isLockBoard) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    // Play flip sound
    soundEngine.playFlip();

    cardEl.classList.add('flipped');
    this.flippedCards.push(cardEl);

    if (this.flippedCards.length === 2) {
      this.checkMatch();
    }
  }

  checkMatch() {
    this.isLockBoard = true;
    const [card1, card2] = this.flippedCards;
    const isMatch = card1.dataset.type === card2.dataset.type;

    if (isMatch) {
      setTimeout(() => {
        card1.classList.add('matched');
        card2.classList.add('matched');
        soundEngine.playMatch();
        this.matchedPairs++;
        this.updateMatchCounter();
        this.flippedCards = [];
        this.isLockBoard = false;

        // Check Victory condition (5 pairs)
        if (this.matchedPairs === 5) {
          setTimeout(() => {
            if (typeof this.onComplete === 'function') {
              this.onComplete();
            }
          }, 600);
        }
      }, 300);
    } else {
      setTimeout(() => {
        card1.classList.remove('flipped');
        card2.classList.remove('flipped');
        this.flippedCards = [];
        this.isLockBoard = false;
      }, 900);
    }
  }

  updateMatchCounter() {
    if (this.matchCounterEl) {
      this.matchCounterEl.textContent = `${this.matchedPairs} / 5`;
    }
  }
}
