import { useNavigate } from "react-router-dom";
import Icon from "../../components/icon";
import TournamentForm, {
  emptyForm,
} from "../../components/tournament/TournamentForm";
import { submitTournament } from "../../services/tournamentApi";

function CreateTournament() {
  const navigate = useNavigate();

  const handleSubmit = async (values) => {
    await submitTournament(values);
    // Status pengajuan ditentukan backend. Frontend hanya mengarahkan ke halamannya.
    navigate("/turnamen/status-pengajuan");
  };

  return (
    <TournamentForm
      mode="create"
      initial={emptyForm}
      submitLabel="Ajukan Turnamen"
      onSubmit={handleSubmit}
      header={
        <h1 className="admin-title t-back-title">
          <button type="button" onClick={() => navigate("/turnamen/kelola")}>
            <Icon name="chevron-left" size={28} /> Kembali
          </button>
        </h1>
      }
    />
  );
}

export default CreateTournament;
