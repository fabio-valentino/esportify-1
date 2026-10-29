<?php
namespace App\Models;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Provinsi extends Model
{
    protected $table = 'provinsi';

    protected $primaryKey = 'id_provinsi';

    protected $fillable = [
        'nama_provinsi',
    ];

    public function kota(): HasMany
    {
        return $this->hasMany(Kota::class, 'id_provinsi', 'id_provinsi');
    }
}
