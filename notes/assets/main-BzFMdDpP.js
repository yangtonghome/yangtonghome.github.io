import"./style-CHn5gg4z.js";var e=document.querySelector(`#note-list`);e&&(e.innerHTML=(await fetch(`./catalog.json`).then(e=>e.json())).map(e=>`
        <article class="note-card">
          <p class="note-meta">${e.meta}${e.locked?` · 需密码`:``}</p>
          <h2><a href="./${e.file}">${e.title}</a></h2>
          <p>${e.summary}</p>
          <a class="text-link" href="./${e.file}">${e.locked?`输入密码阅读 →`:`阅读说明 →`}</a>
        </article>`).join(``));