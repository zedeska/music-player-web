<script>
    import ContextMenu, { Item, Divider, Settings } from "svelte-contextmenu";
    import { push, pop } from "svelte-spa-router";
    
    let userMenu;

    export let logout;
    export let sidebar = false;

    let query;

    function handleKeydown(event) {
        if (event.key === 'Enter') {
            push("/search/" + query);
        }
  }
</script>


<nav class="relative top-0 left-0 w-full p-2 grid grid-cols-3 items-center">
    <div class="col-start-1">
        <span class="md:hidden">
            <img src="/menu.svg" on:click={() => sidebar = !sidebar} />
        </span>
        <span class="hidden md:block"><img src="/arrow-left.svg" alt="" class="col-start-1 cursor-pointer" on:click={pop} /></span>
    </div>
    <div class="flex justify-self-center col-start-2 gap-2 items-center">
    <img on:click={() => {push("/")}} class="cursor-pointer" src="/home.svg" alt="" />
    <input bind:value={query} type="text" placeholder="Search for music..." on:keyup={handleKeydown} class="focus:border-violet-900 border-b-2 border-transparent hover:border-violet-900 ease-in-out transition-all duration-200" />
        <button on:click={() => {push("/search/"+query)}} class="cursor-pointer">
            <img src="/search.svg" alt="">
        </button>
    </div>

    <div class="justify-self-end col-start-3 flex" >
        <button on:click={() => {window.location.href = "https://ko-fi.com/johnjonnyjohn"}} class="cursor-pointer" ><img src="/heart.svg" alt="" /></button>
        <button class="cursor-pointer" on:click={userMenu.createHandler()} ><img src="/user.svg" alt=""></button>
    </div>
</nav>

<ContextMenu bind:this={userMenu} >
    <img src="/xmark.svg" alt="">
    <Divider />
    <Item on:click={() => push("/profile")} >Profile</Item>
    <Item on:click={logout()} >Log out</Item>
</ContextMenu>