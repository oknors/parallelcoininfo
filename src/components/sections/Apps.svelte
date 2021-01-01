<script lang="js">
  import Slide from '../../../../components/element/Slide.svelte'
  export let page;
</script>


<Slide idTag="apps"
       styleClass="step slide"
       dataX="220"
       dataY="-190"
       dataScale="0.05"
       dataAuto="10"
       slideTitle={page["Title"]}
>{@html page["Content"]}</Slide>
