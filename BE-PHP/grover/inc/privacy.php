<div style="font-size:11px; line-height:13px;">
    <strong style="font-size:11px;">
        <?=lang($lng, 'Informativa ai sensi del Decreto Legislativo 30 giugno 2003, n. 196', 'Regulations pursuant to the Data Protection Code (Legislative Decree no. 196/2003 of the Italian Regulations)', 'Information im Sinne der Rechtsverordnung vom 30. Juni 2003, Nr. 196', 'Уведомление в соответствии с Законодательным Декретом от 30 июня 2003, № 196 ')?>
    </strong>
    <br />
    
    <p style="text-align:justify; margin-bottom:0px; line-height:10px; color:#666; font-size:11px;line-height:13px;">
    	<? if($lng=='en' ){?>All the information provided on the form above will be dealt with personally and electronically in order to satisfy all your requests. Data voluntarily provided by you with your consent shall not be disseminated. Any communication of your personal data is always optional; no consequences will be taken for the refusal in communicate the information. Pursuant to the Legislative Decree no. 196/2003, as data subject owner, you will enjoy of the rights to freely access such data, to have them updated or erased without delay if they have been processed unlawfully, to object to the processing of your personal data taken by
    	<?=$config[ 'name'];?>, mailing to  <?=$config[ 'email'];?>.
    	<br />Your data submission through this form represents the authorization to process them.
    	<br />

    	<? }else{?>I dati che vorrete fornirci tramite il presente modulo verranno da noi trattati manualmente e con mezzi elettronici al fine di poter soddisfare la vostra richiesta. I dati non saranno in alcun modo diffusi a terzi. Il conferimento dei dati non è obbligatorio; l'eventuale rifiuto non comporterà alcuna conseguenza.
    	Ai sensi Decreto Legislativo 30 giugno 2003, n. 196, avete diritto di accedere ai vostri dati, chiederne cancellazione, aggiornamento, rettifica, integrazione ed di opposizione al trattamento contattando
    	<?=$config[ 'name'];?>, o scrivendo all'indirizzo e-mail:
    	<?=$config[ 'email'];?>
    	Il conferimento dei dati attraverso il presente modulo rappresenta consenso al trattamento degli stessi.
    	<br />
    	<? } ?>

    </p>
<br>
</div>