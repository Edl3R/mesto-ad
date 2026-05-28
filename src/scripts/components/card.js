export const setLikeButtonState = (likeButton, isLiked) => {
  likeButton.classList.toggle("card__like-button_is-active", isLiked);
};

export const updateLikeDisplay = (likeButton, updatedCard, isLiked) => {
  setLikeButtonState(likeButton, isLiked);
  const likeCountElement = likeButton.closest(".card").querySelector(".card__like-count");
  if (likeCountElement) {
    likeCountElement.textContent = updatedCard.likes.length;
  }
};

const getTemplate = () => {
  return document
    .getElementById("card-template")
    .content.querySelector(".card")
    .cloneNode(true);
};

export const createCardElement = (
  data,
  { onPreviewPicture, onLikeIcon, onDeleteCard, onCardInfo, userId }
) => {
  const cardElement = getTemplate();
  const likeButton = cardElement.querySelector(".card__like-button");
  const deleteButton = cardElement.querySelector(".card__control-button_type_delete");
  const infoButton = cardElement.querySelector(".card__control-button_type_info");
  const cardImage = cardElement.querySelector(".card__image");
  const likeCount = cardElement.querySelector(".card__like-count");

  cardImage.src = data.link;
  cardImage.alt = data.name;
  cardElement.querySelector(".card__title").textContent = data.name;

  const isLiked = data.likes.some((user) => user._id === userId);
  updateLikeDisplay(likeButton, data, isLiked);

  if (data.owner._id === userId) {
    if (onDeleteCard) {
      deleteButton.addEventListener("click", () => onDeleteCard(data._id, cardElement));
    }
  } else {
    deleteButton.remove();
  }

  if (onLikeIcon) {
    likeButton.addEventListener("click", () => {
      const isCurrentlyLiked = likeButton.classList.contains("card__like-button_is-active");
      onLikeIcon(likeButton, data._id, isCurrentlyLiked);
    });
  }

  if (onCardInfo) {
    infoButton.addEventListener("click", () => onCardInfo(data._id));
  }

  if (onPreviewPicture) {
    cardImage.addEventListener("click", () => onPreviewPicture({name: data.name, link: data.link}));
  }

  return cardElement;
};
