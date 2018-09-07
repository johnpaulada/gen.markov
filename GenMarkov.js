const GenMarkov = (corpus, nGram = 2) => {
  const tokens = [corpus].map(sanitize).map(tokenize)[0];
  const chain = [tokens].map(partition(nGram)).map(markovChain)[0];

  return {
    generate(limit) {
      const initialValue = getInitialValue(tokens, nGram);
      const result = extractValue(chain, initialValue, limit, initialValue);

      return result;
    }
  };
};

function extractValue(chain, value, limit, result) {
  if (limit === 0) return result;

  const word = extractWord(chain[value.trim()]);
  const splitted = result.split(" ");
  const lastIndex = splitted.length - 1;
  const lastWord = splitted[lastIndex];

  return extractValue(
    chain,
    `${lastWord} ${word}`,
    limit - 1,
    `${result} ${word}`
  );
}

function extractWord(possibleWords) {
  if (!possibleWords) return "";

  return [possibleWords]
    .map(Object.entries)
    .map(flattenRepeat)
    .map(selectOne)[0];
}

function flattenRepeat(entries) {
  return entries.reduce((result, entry) => {
    return [...result, ...Array(entry[1]).fill(entry[0])];
  }, []);
}

function selectOne(list) {
  const size = list.length;
  const randomIndex = getRandomInt(0, size);
  const selectedItem = list[randomIndex];

  return selectedItem;
}

function getInitialValue(tokens, nGram) {
  const randomIndex = getRandomInt(0, tokens.length);
  const partition = createSubpart(tokens, randomIndex, nGram);
  const serializedPartition = partition.join(" ");

  return serializedPartition;
}

function markovChain(list) {
  const chain = list.reduce((result, [key, resultant]) => {
    const serializedkey = key.join(" ");
    const updatedValue = getUpdatedValue(result, serializedkey, resultant);

    return {
      ...result,
      [serializedkey]: { [resultant]: updatedValue }
    };
  }, {});

  return chain;
}

function getUpdatedValue(result, serializedkey, resultant) {
  if (serializedkey in result) {
    const hasresultant = resultant in result[serializedkey];

    if (hasresultant) {
      const incremented = result[serializedkey][resultant] + 1;

      return incremented;
    }
  }

  return 1;
}

function partition(nGram) {
  return tokens => {
    const length = tokens.length;

    const partitions = tokens.reduce((result, _, index, list) => {
      const maxIndex = length - nGram;
      const notLastIndex = index < maxIndex;

      if (notLastIndex) {
        const key = createSubpart(list, index, nGram);
        const resultant = list[index + nGram];

        return [...result, [key, resultant]];
      }

      return result;
    }, []);

    return partitions;
  };
}

function createSubpart(list, index, count, result = []) {
  if (count === 0) {
    return result;
  }

  return createSubpart(list, index + 1, count - 1, [...result, list[index]]);
}

function sanitize(text) {
  return text.toLowerCase().replace(/[,\.'"\?\(\)]/g, "");
}

function tokenize(text) {
  return text.split(/[ \n\r]{1,}/g);
}

function getRandomInt(min, max) {
  min = Math.ceil(min);
  max = Math.floor(max);

  return Math.floor(Math.random() * (max - min)) + min;
}
