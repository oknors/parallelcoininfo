<script lang="js">
  import Slide from '../../../../components/element/Slide.svelte'
  export let page;
</script>

<Slide idTag="story"
       styleClass="step slide"
       dataX="344"
       dataY="-140"
       dataScale="0.05"
       dataAuto="10"
       slideTitle={page["Title"]}
>{@html page["Content"]}</Slide>
