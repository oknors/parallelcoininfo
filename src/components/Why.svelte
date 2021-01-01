<script lang="js">
  import Shadow from '../../../components/txt/Shadow.svelte'
  import ParallelCoinLogo from '../../../components/svg/ParallelCoinLogo.svelte'
  export let page;
</script>


<div id="why" class="step slide" data-x="0" data-y="-3" data-scale="1" data-autoplay="2">
  <div class="w-slide h-slide flex flex-col justify-center items-center">
    <div class="absolute top-32 pr-16 w-full flex justify-end items-end">
      <div class="mb-48 toplayer-lite bottomlayer-yellow">
        <ParallelCoinLogo styleClass={"w-32 h-32 p-3 animate-pulse svgFull"} />

      </div>
      <div class="mb-32 toplayer-lite bottomlayer-orange">
        <ParallelCoinLogo styleClass={"w-32 h-32 p-3 animate-pulse svgFull"} />

      </div>
      <div class="mb-16 toplayer-lite bottomlayer-red">
        <ParallelCoinLogo styleClass={"w-32 h-32 p-3 animate-pulse svgFull"} />

      </div>
      <div class="toplayer-lite bottomlayer-purple">
        <ParallelCoinLogo styleClass={"w-32 h-32 p-3 animate-pulse svgFull"} />
      </div>
      <div>

      </div>
    </div>
    <div class="font-brand text-center">
      <Shadow styleClass={"artificial"}>{page["Title"]}</Shadow>
    </div>
    <div class="absolute bottom-32 pl-16 w-full flex justify-start items-start">
      <div>

      </div>
      <div class="toplayer-lite bottomlayer-blue">
        <ParallelCoinLogo styleClass={"w-32 h-32 p-3 animate-pulse svgFull"} />
      </div>
      <div class="mt-16 toplayer-lite bottomlayer-green">
        <ParallelCoinLogo styleClass={"w-32 h-32 p-3 animate-pulse svgFull"} />
      </div>
      <div class="mt-32 toplayer-lite bottomlayer-gray">
        <ParallelCoinLogo styleClass={"w-32 h-32 p-3 animate-pulse svgFull"} />
      </div>
      <div class="mt-48 toplayer-lite bottomlayer-dark">
        <ParallelCoinLogo styleClass={"w-32 h-32 p-3 animate-pulse svgFull"} />
      </div>
    </div>
  </div>
</div>
<style global>
  .font-brand{
    font-max-size: 50%;
  }
.svgFull{
  max-width: 100%;
  height: auto;
  opacity: 0.6;
  transition: background 300ms ease-in-out;
}
.svgFull:hover {
  opacity: 0.6;
}

</style>
