<script lang="js">
  import Shadow from '../../../components/txt/Shadow.svelte'
  import ParallelCoinLogo from '../../../components/svg/ParallelCoinLogo.svelte'
  export let page;
</script>

<div id="what" class="step slide" data-x="0" data-y="0" data-scale="1" data-rotate-x="90" data-rotate-z="90" data-autoplay="10">
  <div class="w-slide h-slide  flex flex-col justify-center items-center">
    <div class="p-10 w-full font-brand uppercase text-4xl font-bold text-left">
      <Shadow>{page["Title"]}</Shadow>
    </div>
    <div class="p-10 w-full text-1xl text-left">
      {@html page["Content"]}
    </div>
</div>
  </div>

<style global>

</style>
