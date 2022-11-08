<template>
  <a
    :href="`https://liker.land/nft/class/${classId}`"
    target="_blank"
    rel="noopener"
  >{{ name }} </a>
</template>

<script>
export default {
  name: 'NftLink',
  props: {
    classId: {
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
