class EcosquirrelFreeTokenCollection {
}

Hooks.once("init", () => {
  game.settings.register("ecosquirrel-free-token-collection", "Ecosquirrel", {
    name: "URL",
    scope: "world",
    config: true,
    default: "http://www.ecosquirrel.de",
    type: String
  });

  Hooks.on("renderSettingsConfig", async (app, html, data) => {
    console.log("[Ecosquirrel] Einstellungen-UI wird modifiziert...");

    const tokenBasePath = "modules/ecosquirrel-free-token-collection/token/";
    const categories = {
      "fighterMale": "fighter/",
      "fighterFemale": "fighter/",
      "peasantMale": "peasant/",
      "peasantFemale": "peasant/",
      "peasantBoy": "peasant/",
      "peasantGirl": "peasant/"
    };

    async function getImagesForCategories() {
      let allImages = {};
      for (let category in categories) {
        const fullPath = `${tokenBasePath}${categories[category]}`;

        try {
          console.log(`[Ecosquirrel] Versuche Bilder aus ${fullPath} zu laden...`);
          
          const files = await FilePicker.browse("data", fullPath);
          
          if (!files || !files.files) {
            console.warn(`[Ecosquirrel] Ordner ${fullPath} ist leer oder nicht vorhanden.`);
            allImages[category] = [];
            continue;
          }

          allImages[category] = files.files.filter(file => {
            const fileName = file.split("/").pop();
            return fileName.endsWith(".webp") && 
              ((category === "fighterMale" && fileName.includes("token_fighter_man")) ||
               (category === "fighterFemale" && fileName.includes("token_fighter_woman")) ||
               (category === "peasantMale" && fileName.includes("token_peasant_man")) ||
               (category === "peasantFemale" && fileName.includes("token_peasant_woman")) ||
               (category === "peasantBoy" && fileName.includes("token_peasant_boy")) ||
               (category === "peasantGirl" && fileName.includes("token_peasant_girl")));
          }).sort(() => 0.5 - Math.random()).slice(0, 6); // Zufällig 6 Bilder auswählen

          console.log(`[Ecosquirrel] Geladene Bilder für ${category}:`, allImages[category]);

        } catch (error) {
          console.error(`[Ecosquirrel] Fehler beim Laden der Bilder für ${category}:`, error);
          allImages[category] = [];
        }
      }
      return allImages;
    }

    function createImageGallery(imageUrls) {
      let gallery = `
        <div style="margin-top: 10px; display: flex; flex-wrap: wrap; gap: 10px; justify-content: center; align-items: center; max-width: 100%;" class="token-gallery">
      `;
      imageUrls.forEach(url => {
        gallery += `
          <div style="width: 130px; height: 130px; display: flex; justify-content: center; align-items: center;">
            <img src="${url}" style="width: 130px; height: 130pxs; object-fit: cover; border: none; box-shadow: none;">
          </div>`;
      });
      gallery += `</div>`;
      return gallery;
    }

    const settingsTab = html.find(`section[data-tab="ecosquirrel-free-token-collection"]`);
    if (settingsTab.length) {
      console.log("[Ecosquirrel] Tab für Modul gefunden, füge HTML hinzu...");

      html.find("h2.border:contains('Ecosquirrel Free Token Collection')").remove();
      html.find("div.form-group[data-setting-id='ecosquirrel-free-token-collection.Ecosquirrel']").remove();
      html.find("button[type='submit']").remove();

      const header = `
        <div style="display: flex; align-items: center; gap: 10px;">
          <a href="https://www.ecosquirrel.de" target="_blank"><img src="modules/ecosquirrel-free-token-collection/images/ecosquirrel_logo_text.webp" style="width:200px; height: 40px; object-fit: cover; border: none; box-shadow: none;"></a>
        </div>
        <h2 id="token-header" class="border" style="margin-top: 10px;">${game.i18n.localize("es.tokenSelection")}</h2>
      `;

      const dropdown = `
        ${game.i18n.localize("es.selectCategoryDescription1")} 
        <ul>
          <li>${game.i18n.localize("es.category.fighterMale")} / ${game.i18n.localize("es.category.fighterFemale")}</li>
          <li>${game.i18n.localize("es.category.peasantMale")} / ${game.i18n.localize("es.category.peasantFemale")}</li>
          <li>${game.i18n.localize("es.category.peasantBoy")} / ${game.i18n.localize("es.category.peasantGirl")}</li>
        </ul>
        ${game.i18n.localize("es.selectCategoryDescription2")} 
        <ul>
          <li><code>${tokenBasePath}</code></li>
        </ul>
        ${game.i18n.localize("es.selectCategoryDescription3")} 
        <br><label for="token-selector">${game.i18n.localize("es.selectCategory")}</label>
        <select id="token-selector">
          <option value="random">${game.i18n.localize("es.randomSelection")}</option>
          <option value="fighterMale">${game.i18n.localize("es.category.fighterMale")}</option>
          <option value="fighterFemale">${game.i18n.localize("es.category.fighterFemale")}</option>
          <option value="peasantMale">${game.i18n.localize("es.category.peasantMale")}</option>
          <option value="peasantFemale">${game.i18n.localize("es.category.peasantFemale")}</option>
          <option value="peasantBoy">${game.i18n.localize("es.category.peasantBoy")}</option>
          <option value="peasantGirl">${game.i18n.localize("es.category.peasantGirl")}</option>
        </select>
        <div id="token-container"></div>
      `;
      settingsTab.append(header + dropdown);

      const tokenContainer = settingsTab.find("#token-container");
      const tokenHeader = settingsTab.find("#token-header");

      getImagesForCategories().then(allImages => {
        function updateGallery(selection) {
          selection = selection.trim();

          if (allImages[selection] && allImages[selection].length > 0) {
            allImages[selection] = allImages[selection].sort(() => 0.5 - Math.random()).slice(0, 6);
            tokenHeader.text(`${game.i18n.localize("es.tokenSelection")} - ${game.i18n.localize(`es.category.${selection}`)}`);
            tokenContainer.html(createImageGallery(allImages[selection]));
          } else {
            tokenHeader.text(`${game.i18n.localize("es.tokenSelection")} - ${game.i18n.localize("es.randomSelection")}`);
            const randomImages = Object.values(allImages).flat().sort(() => 0.5 - Math.random()).slice(0, 6);
            tokenContainer.html(createImageGallery(randomImages));
          }
        }
        
        settingsTab.find("#token-selector").on("change", function () {
          updateGallery(this.value);
        });
        
        updateGallery("random");
      });
    } else {
      console.warn("[Ecosquirrel] Modul-Tab nicht gefunden! Ist der Modul-Name korrekt?");
    }
  });
});
