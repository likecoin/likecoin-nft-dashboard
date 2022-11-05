<template>
  <a
    :href="`https://liker.land/${wallet}`"
    target="_blank"
    rel="noopener"
  >{{ wallet }} </a>
</template>

<script>
export default {
  name: 'UserLink',
  props: {
    wallet: {
      type: String,
      required: true,
    },
  },
};
</script>
