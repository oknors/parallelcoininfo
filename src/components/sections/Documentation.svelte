<script lang="js">
  import Slide from '../../../../components/element/Slide.svelte'
  export let page;
</script>

<Slide idTag="documentation"
       styleClass="step slide"
       dataX="-210"
       dataY="202"
       dataScale="0.05"
       dataAuto="10"
       slideTitle={page["Title"]}
>{@html page["Content"]}
  <a href="http://doc.parallelcoin.info:4433" class="m-5 p-3 rounded-lg text-black transition duration-500 ease-in-out bg-white-default hover:text-white-default hover:bg-black transform hover:-translate-y-1 hover:scale-110">
    Documentation
  </a>
</Slide>
