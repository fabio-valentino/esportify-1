import LdIcon from "./LandingIcons";
import Poster from "./Poster";

function CommunityCard({ item, onOpen }) {
  return (
    <article className="ld-card ld-card-click" onClick={() => onOpen(item)}>
      <div className="ld-poster ld-poster-wide">
        <Poster src={item.image} alt={item.name} fallbackText={item.name} />
        {item.game && (
          <span className="ld-badge ld-badge-game">{item.game}</span>
        )}
      </div>

      <div className="ld-card-body">
        <h3 className="ld-card-title" title={item.name}>
          {item.name}
        </h3>
        {item.description && <p className="ld-desc">{item.description}</p>}
        <p className="ld-meta">
          <LdIcon name="users" size={14} />
          {item.members.toLocaleString("id-ID")} Anggota
        </p>
        <button type="button" className="ld-btn ld-btn-s ld-btn-block">
          Lihat Komunitas
        </button>
      </div>
    </article>
  );
}

export default CommunityCard;
