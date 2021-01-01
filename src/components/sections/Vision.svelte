<script lang="js">
  import Slide from '../../../../components/element/Slide.svelte';
  export let page;
</script>

<Slide
  idTag="vision"
  styleClass="step slide"
  dataX="85"
  dataY="-275"
  dataScale="0.05"
  dataAuto="10"
  slideTitle={page["Title"]}
>{@html page["Content"]}</Slide>
