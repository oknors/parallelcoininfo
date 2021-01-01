<script lang="js">
  import Slide from '../../../../components/element/Slide.svelte';
  export let page;
</script>


<Slide idTag="status"
       styleClass="step slide"
       dataX="-80"
       dataY="252"
       dataScale="0.05"
       dataAuto="10"
       slideTitle={page["Title"]}
>{@html page["Content"]}

  <div class="w-full flex justify-around">
    <div class="p-1">
      <div class="mb-3 p-2 w-full rounded bg-black">
        <h4 class="p-2 w-full rounded-sm bg-white-default text-3xl text-black text-center">1356655</h4>
        <p class="p-1 w-full font-brand text-sm text-center">Block height</p>
      </div>
      <div class="p-2 w-full rounded bg-black">
        <h4 class="p-2 w-full rounded-sm bg-white-default text-3xl text-black text-center">1356655 MH/s</h4>
        <p class="p-1 w-full font-brand text-sm text-center">Difficulty</p>
      </div>
    </div>
    <div class="p-1">
      <div class="mb-3 p-2 w-full rounded bg-black">
        <h4 class="p-2 w-full rounded-sm bg-white-default text-3xl text-black text-center">$135.65</h4>
        <p class="p-1 w-full font-brand text-sm text-center">Price</p>
      </div>
      <div class="p-2 w-full rounded bg-black">
        <h4 class="p-2 w-full rounded-sm bg-white-default text-3xl text-black text-center">$15,135,656.55</h4>
        <p class="p-1 w-full font-brand text-sm text-center">Market cap</p>
      </div>
    </div>
  </div>
  <div class="w-full flex justify-center">
    <a href="http://exporer.parallelcoin.info" class="m-5 p-3 rounded-lg text-black transition duration-500 ease-in-out bg-white-default hover:text-white-default hover:bg-black transform hover:-translate-y-1 hover:scale-110">
      Blockchain details
    </a>
    <a href="http://market.parallelcoin.info" class="m-5 p-3 rounded-lg text-black transition duration-500 ease-in-out bg-white-default hover:bg-black transform hover:-translate-y-1 hover:scale-110">
      Market details
    </a>
  </div>
</Slide>
