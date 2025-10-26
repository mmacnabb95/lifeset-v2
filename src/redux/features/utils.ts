export const mergePayloadArrayById = (
  payloadArray: any[],
  stateArray: any[],
) => {
  const itemsNotAreadyInStateArray: any[] = [];
  payloadArray.forEach((item: { id: any }) => {
    if (!stateArray.find((u: { id: any }) => u.id === item.id)) {
      itemsNotAreadyInStateArray.push(item);
    }
  });
  return itemsNotAreadyInStateArray;
};
