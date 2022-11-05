<template>
  <a
    :href="`https://liker.land/nft/class/${id}`"
    target="_blank"
    rel="noopener"
  >{{ name }} </a>
</template>

<script>
export default {
  name: 'NftLink',
  props: {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      default: '',
    },
  },
};
</script>
