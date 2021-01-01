<script lang="js">
  import Icon from 'svelte-awesome/components/Icon.svelte'
  import { facebook, twitter, bitcoin, reddit } from 'svelte-awesome/icons';
  export let page;

</script>


<div id="where" class="step slide" data-x="-140" data-z="10000" data-scale="6" data-rotate-x="90" _data-autoplay="10">
  <div class="w-slide h-slide flex flex-col justify-start items-center">
    <div class="p-10 font-brand uppercase text-5xl font-bold text-center">
      <span class="">{page["Title"]}</span>
    </div>
    <div class="pt-4 prose-2xl text-white-default">
      <h3>ParallelCoin:</h3>
      <div class="flex flex-col items-center">
        <div class="w-full flex justify-between items-center">
          <h5 class="p-1">Download</h5><a href="http://download.parallelcoin.info:4433/" target="_blank" class="p-1">download.parallelcoin.info</a>
        </div>
        <div class="w-full flex justify-between items-center">
          <h5 class="p-1">Documentation</h5><a href="http://download.parallelcoin.info:4433/" target="_blank" class="p-1">doc.parallelcoin.info</a>
        </div>
        <div class="w-full flex justify-between items-center">
          <h5 class="p-1">Log</h5><a href="http://log.parallelcoin.info:4433/" target="_blank" class="p-1">log.parallelcoin.info</a>
        </div>
        <div class="w-full flex justify-between items-center">
          <h5 class="p-1">Story</h5><a href="http://story.parallelcoin.info:4433/" target="_blank" class="p-1">story.parallelcoin.info</a>
        </div>
        <div class="w-full flex justify-between items-center">
          <h5 class="p-1">Status</h5><a href="http://status.parallelcoin.info:4433/" target="_blank" class="p-1">status.parallelcoin.info</a>
        </div>
        <div class="w-full flex justify-between items-center">
          <h5 class="p-1">Explorer</h5><a href="http://explorer.parallelcoin.info:4433/" target="_blank" class="p-1">explorer.parallelcoin.info</a>
        </div>
      </div>
      <h3>Social networks:</h3>
      <div class="flex justify-between items-center">
      <a href="https://bitcointalk.org/index.php?topic=1097017.0" target="_blank" class="p-10"><Icon data={bitcoin} scale="5" /></a>
      <a href="https://twitter.com/parallelcoinduo" target="_blank" class="p-10"><Icon data={twitter} scale="5" /></a>
      <a href="https://www.reddit.com/user/Parallelcoin/" target="_blank" class="p-10"><Icon data={reddit} scale="5" /></a>
      <a href="https://bitcointalk.org/index.php?topic=1097017.0" target="_blank" class="p-10"><Icon data={facebook} scale="5" /></a>
      </div>
    </div>
  </div>
</div>
<style global>

</style>
